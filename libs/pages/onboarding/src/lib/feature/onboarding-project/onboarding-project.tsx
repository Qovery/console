import { useAuth0 } from '@auth0/auth0-react'
import { PlanEnum } from 'qovery-typescript-axios'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAddCreditCard, useCreateOrganization, useDeleteOrganization } from '@qovery/domains/organizations/feature'
import { useCreateProject } from '@qovery/domains/projects/feature'
import { useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { useAuth } from '@qovery/shared/auth'
import {
  ENVIRONMENTS_GENERAL_URL,
  ENVIRONMENTS_URL,
  ONBOARDING_MORE_URL,
  ONBOARDING_PERSONALIZE_URL,
  ONBOARDING_URL,
} from '@qovery/shared/routes'
import { toastError } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
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

  const addCardIfPresent = async (organizationId: string) => {
    if (!cardToken || shouldSkipBilling) return

    try {
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
    } catch (error) {
      toastError(error as Error)
      throw error
    }
  }

  const onSubmit = handleSubmit(async (data) => {
    if (!data) return

    const currentData = {
      organization_name: data.organization_name,
      project_name: data.project_name,
      admin_email,
    }
    setContextValue && setContextValue(currentData)

    setIsSubmitting(true)
    let createdOrganizationId: string | null = null

    try {
      const organization = await createOrganization({
        organizationRequest: {
          name: data.organization_name,
          plan: planToUse,
          admin_emails: admin_email ? [admin_email] : user?.email ? [user.email] : [],
        },
      })
      createdOrganizationId = organization.id
      await getAccessTokenSilently({ cacheMode: 'off' })

      if (organization.id) {
        await addCardIfPresent(organization.id)
      }

      const project = await createProject({
        organizationId: organization.id,
        projectRequest: {
          name: data.project_name,
        },
      })

      if (project) {
        navigate(ENVIRONMENTS_URL(organization.id, project.id) + ENVIRONMENTS_GENERAL_URL)
      }
    } catch (error) {
      console.error(error)
      toastError(error as Error)
      if (createdOrganizationId) {
        try {
          await deleteOrganization({ organizationId: createdOrganizationId })
        } catch (cleanupError) {
          console.error('Failed to clean up organization after card failure', cleanupError)
        }
      }
      const fallbackRoute = shouldSkipBilling ? ONBOARDING_PERSONALIZE_URL : ONBOARDING_MORE_URL
      navigate(`${ONBOARDING_URL}${fallbackRoute}`)
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <StepProject
      onSubmit={onSubmit}
      control={control}
      loading={isSubmitting}
      onFirstStepBack={shouldSkipBilling ? () => navigate(`${ONBOARDING_URL}${ONBOARDING_PERSONALIZE_URL}`) : undefined}
    />
  )
}

export default OnboardingProject
