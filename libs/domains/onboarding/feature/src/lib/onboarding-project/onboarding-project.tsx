import { useGTMDispatch } from '@elgorditosalsero/react-gtm-hook'
import { useNavigate } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { type SignUpRequest } from 'qovery-typescript-axios'
import { useContext, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useCreateOrganization, useEditBillingInfo, useOrganizations } from '@qovery/domains/organizations/feature'
import { useCreateProject } from '@qovery/domains/projects/feature'
import { useCreateUserSignUp, useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { useAuth } from '@qovery/shared/auth'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { type SerializedError } from '@qovery/shared/utils'
import { ContextOnboarding } from '../container/container'
import { StepProject } from '../step-project/step-project'

export function OnboardingProject({ previousUrl }: { previousUrl?: string }) {
  useDocumentTitle('Onboarding Organization - Qovery')

  const navigate = useNavigate()
  const { user, getAccessTokenSilently } = useAuth()
  const sendDataToGTM = useGTMDispatch()
  const { data: organizations = [] } = useOrganizations()
  const { organization_name, project_name, admin_email, selectedPlan } = useContext(ContextOnboarding)
  const { mutateAsync: createOrganization } = useCreateOrganization()
  const { mutateAsync: createProject } = useCreateProject({ silently: true })
  const { mutateAsync: editBillingInfo } = useEditBillingInfo({ silently: true })
  const methods = useForm<{ project_name: string; organization_name: string }>({
    defaultValues: {
      organization_name,
      project_name: project_name || 'main',
    },
  })
  const { data: userSignUp } = useUserSignUp()
  const { mutateAsync: createUserSignUp } = useCreateUserSignUp()
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        current_step: 'project',
        infrastructure_hosting: userSignUp.infrastructure_hosting ?? undefined,
      }

      await createUserSignUp(signUpPayload)
    }
  }

  const handleBack = () => {
    if (previousUrl) {
      navigate({ href: previousUrl, replace: true })
      return
    }

    if (organizations.length > 0) {
      navigate({ to: '/organization/$organizationId/overview', params: { organizationId: organizations[0].id } })
      return
    }

    navigate({ to: '/onboarding/personalize' })
  }

  const onSubmit = methods.handleSubmit(async (data) => {
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      const organization = await createOrganization({
        organizationRequest: {
          name: data.organization_name,
          plan: selectedPlan,
          admin_emails: admin_email.length > 0 ? [admin_email] : user?.email ? [user.email] : [],
        },
      })

      // Note: Refresh tokens do not work in private browsers without our Auth0 domain and Safari (private and normal mode)
      await getAccessTokenSilently({ cacheMode: 'off' })

      await updateBillingInfo(organization.id)

      await createProject({
        organizationId: organization.id,
        projectRequest: {
          name: data.project_name,
        },
      })

      await createCargoSignup()

      posthog.capture('onboarding-organization-created', {
        plan: selectedPlan,
      })
      await sendDataToGTM({ event: 'onboarding-organization-created', plan: selectedPlan })
      navigate({ to: '/organization/$organizationId/overview', params: { organizationId: organization.id } })
    } catch (error) {
      if ((error as SerializedError).code === '409') {
        toastError(error as unknown as SerializedError)
        return
      }
    } finally {
      toast(ToastEnum.SUCCESS, 'Your organization and project have been created')
      setIsSubmitting(false)
    }
  })

  return (
    <FormProvider {...methods}>
      <StepProject onSubmit={onSubmit} loading={isSubmitting} onFirstStepBack={handleBack} />
    </FormProvider>
  )
}

export default OnboardingProject
