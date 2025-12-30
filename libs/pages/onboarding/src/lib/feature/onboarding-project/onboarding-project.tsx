import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { PlanEnum } from 'qovery-typescript-axios'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  useAddCreditCard,
  useCreateOrganization,
  useDeleteOrganization,
  useEditBillingInfo,
} from '@qovery/domains/organizations/feature'
import { useCreateProject } from '@qovery/domains/projects/feature'
import { useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { useAuth } from '@qovery/shared/auth'
import {
  ENVIRONMENTS_GENERAL_URL,
  ENVIRONMENTS_URL,
  ONBOARDING_PERSONALIZE_URL,
  ONBOARDING_PLANS_URL,
  ONBOARDING_URL,
} from '@qovery/shared/routes'
import { toastError } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { type SerializedError } from '@qovery/shared/utils'
import { StepProject } from '../../ui/step-project/step-project'
import { ContextOnboarding } from '../container/container'

export function OnboardingProject() {
  useDocumentTitle('Onboarding Organization - Qovery')

  const navigate = useNavigate()
  const { user } = useAuth0()
  const { getAccessTokenSilently } = useAuth()
  const { mutateAsync: createOrganization } = useCreateOrganization()
  const { mutateAsync: createProject } = useCreateProject()
  const { mutateAsync: addCreditCard } = useAddCreditCard()
  const { mutateAsync: editBillingInfo } = useEditBillingInfo()
  const { mutateAsync: deleteOrganization } = useDeleteOrganization()
  const { handleSubmit, control, setValue } = useForm<{ project_name: string; organization_name: string }>()
  const { data: userSignUp } = useUserSignUp()
  const {
    organization_name,
    project_name,
    admin_email,
    selectedPlan,
    setContextValue,
    cardToken,
    cardLast4,
    cardExpiryMonth,
    cardExpiryYear,
  } = useContext(ContextOnboarding)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const shouldSkipBilling = userSignUp?.dx_auth === true
  const planToUse = shouldSkipBilling ? PlanEnum.USER_2025 : selectedPlan

  useEffect(() => {
    setValue('organization_name', organization_name)
    setValue('project_name', project_name || 'main')
  }, [organization_name, project_name, setValue])

  const updateBillingInfo = async (organizationId: string) => {
    await editBillingInfo({
      organizationId,
      billingInfoRequest: {
        first_name: userSignUp?.first_name ?? '',
        last_name: userSignUp?.last_name ?? '',
        company: userSignUp?.company_name ?? '',
        email: admin_email.length > 0 ? admin_email : user?.email ?? '',
        address: '',
        city: 'NEW YORK CITY',
        zip: '10001',
        country_code: 'US',
      },
    })
  }

  const addCardIfPresent = async (organizationId: string) => {
    if (!cardToken || shouldSkipBilling) {
      await updateBillingInfo(organizationId)
      return
    }

    await addCreditCard({
      organizationId,
      creditCardRequest: {
        token: cardToken,
        cvv: '',
        number: cardLast4 ? `****${cardLast4}` : '',
        expiry_year: cardExpiryYear ?? 0,
        expiry_month: cardExpiryMonth ?? 0,
      },
    })

    await updateBillingInfo(organizationId)
  }

  const handleBack = () => {
    if (shouldSkipBilling) {
      // TODO: change that
      navigate({ to: `${ONBOARDING_URL}${ONBOARDING_PERSONALIZE_URL}` })
    } else {
      // TODO: change that
      navigate({ to: `${ONBOARDING_URL}/plans` })
    }
  }

  const onSubmit = handleSubmit(async (data) => {
    const currentData = {
      organization_name: data.organization_name,
      project_name: data.project_name,
      admin_email,
    }
    setContextValue?.(currentData)

    setIsSubmitting(true)
    let createdOrganizationId: string | null = null

    try {
      const organization = await createOrganization({
        organizationRequest: {
          name: data.organization_name,
          plan: planToUse,
          admin_emails: admin_email.length > 0 ? [admin_email] : user?.email ? [user.email] : [],
        },
      })
      createdOrganizationId = organization.id
      await getAccessTokenSilently({ cacheMode: 'off' })

      await addCardIfPresent(createdOrganizationId)

      const project = await createProject({
        organizationId: createdOrganizationId,
        projectRequest: {
          name: data.project_name,
        },
      })

      posthog.capture('onboarding-organization-created', {
        plan: planToUse,
      })

      // TODO: change that
      navigate({ to: `${ENVIRONMENTS_URL(createdOrganizationId, project.id)}${ENVIRONMENTS_GENERAL_URL}` })
    } catch (error) {
      if ((error as SerializedError).code === '409') {
        toastError(error as unknown as SerializedError)
        return
      }

      if (createdOrganizationId) {
        try {
          await deleteOrganization({ organizationId: createdOrganizationId })
        } catch (cleanupError) {
          console.error('Failed to clean up organization after card failure', cleanupError)
        }
      }
      const fallbackRoute = shouldSkipBilling ? ONBOARDING_PERSONALIZE_URL : ONBOARDING_PLANS_URL
      // TODO: change that
      navigate({ to: `${ONBOARDING_URL}${fallbackRoute}` })
    } finally {
      setIsSubmitting(false)
    }
  })

  return <StepProject onSubmit={onSubmit} control={control} loading={isSubmitting} onFirstStepBack={handleBack} />
}

export default OnboardingProject
