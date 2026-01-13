import posthog from 'posthog-js'
import { PlanEnum, type SignUpRequest } from 'qovery-typescript-axios'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCreateOrganization, useEditBillingInfo } from '@qovery/domains/organizations/feature'
import { useCreateProject } from '@qovery/domains/projects/feature'
import { useCreateUserSignUp, useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { useAuth } from '@qovery/shared/auth'
import {
  ENVIRONMENTS_GENERAL_URL,
  ENVIRONMENTS_URL,
  ONBOARDING_PERSONALIZE_URL,
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
  const location = useLocation()
  const { user, getAccessTokenSilently } = useAuth()
  const { mutateAsync: createOrganization } = useCreateOrganization()
  const { mutateAsync: createProject } = useCreateProject()
  const { mutateAsync: editBillingInfo } = useEditBillingInfo()
  const { handleSubmit, control, setValue } = useForm<{ project_name: string; organization_name: string }>()
  const { data: userSignUp } = useUserSignUp()
  const { mutateAsync: createUserSignUp } = useCreateUserSignUp()
  const { organization_name, project_name, admin_email, selectedPlan, setContextValue } = useContext(ContextOnboarding)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const shouldSkipBilling = userSignUp?.dx_auth === true
  const planToUse = shouldSkipBilling ? PlanEnum.USER_2025 : selectedPlan
  const previousUrl = location.state?.previousUrl

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

  const createCargoSignup = async () => {
    const hasRequiredSignUpFields =
      !!userSignUp?.first_name && !!userSignUp?.last_name && !!userSignUp?.user_email && !!userSignUp?.qovery_usage

    if (hasRequiredSignUpFields) {
      const signUpPayload: SignUpRequest = {
        first_name: userSignUp.first_name,
        last_name: userSignUp.last_name,
        user_email: userSignUp.user_email,
        type_of_use: userSignUp.type_of_use,
        qovery_usage: userSignUp.qovery_usage,
        company_name: userSignUp.company_name ?? undefined,
        company_size: userSignUp.company_size ?? undefined,
        user_role: userSignUp.user_role ?? undefined,
        qovery_usage_other: userSignUp.qovery_usage_other ?? undefined,
        user_questions: userSignUp.user_questions ?? undefined,
        current_step: 'billing',
        dx_auth: userSignUp.dx_auth ?? undefined,
        infrastructure_hosting: userSignUp.infrastructure_hosting ?? undefined,
      }

      await createUserSignUp(signUpPayload)
    }
  }

  const handleBack = () => {
    if (previousUrl !== undefined) {
      navigate(previousUrl)
    } else if (shouldSkipBilling) {
      navigate(`${ONBOARDING_URL}${ONBOARDING_PERSONALIZE_URL}`)
    } else {
      navigate(-1)
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

    try {
      const organization = await createOrganization({
        organizationRequest: {
          name: data.organization_name,
          plan: planToUse,
          admin_emails: admin_email.length > 0 ? [admin_email] : user?.email ? [user.email] : [],
        },
      })

      // Note: Refresh tokens do not work in private browsers without our Auth0 domain
      await getAccessTokenSilently({ cacheMode: 'off' })

      await updateBillingInfo(organization.id)

      const project = await createProject({
        organizationId: organization.id,
        projectRequest: {
          name: data.project_name,
        },
      })

      await createCargoSignup()

      posthog.capture('onboarding-organization-created', {
        plan: planToUse,
      })

      navigate(ENVIRONMENTS_URL(organization.id, project.id) + ENVIRONMENTS_GENERAL_URL)
    } catch (error) {
      if ((error as SerializedError).code === '409') {
        toastError(error as unknown as SerializedError)
        return
      }
    } finally {
      setIsSubmitting(false)
    }
  })

  return <StepProject onSubmit={onSubmit} control={control} loading={isSubmitting} onFirstStepBack={handleBack} />
}

export default OnboardingProject
