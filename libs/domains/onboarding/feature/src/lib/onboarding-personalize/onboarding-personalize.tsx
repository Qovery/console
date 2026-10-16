import { useNavigate } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { TypeOfUseEnum } from 'qovery-typescript-axios'
import { useContext, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useCreateOrganization } from '@qovery/domains/organizations/feature'
import { useCreateProject } from '@qovery/domains/projects/feature'
import { useCreateUserSignUp, useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { useAuth } from '@qovery/shared/auth'
import { toastError } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ContextOnboarding } from '../container/container'
import { type ProfileFormValues, StepPersonalize } from '../step-personalize/step-personalize'
import { pushToDataLayer } from '../utils/data-layer'

export function OnboardingPersonalize() {
  useDocumentTitle('Onboarding Personalize - Qovery')
  const navigate = useNavigate()
  const { user, getAccessTokenSilently } = useAuth()

  const { selectedPlan, phone } = useContext(ContextOnboarding)
  const [createdOrganizationId, setCreatedOrganizationId] = useState<string>()
  const [projectCreated, setProjectCreated] = useState(false)
  const { mutateAsync: createProject } = useCreateProject({ silently: true })
  const { mutateAsync: createOrganization } = useCreateOrganization()
  const { data: userSignUp, refetch: refetchUserSignUp } = useUserSignUp()
  const { mutateAsync: createUserSignUp } = useCreateUserSignUp()

  const userEmail = user?.email || userSignUp?.user_email || ''

  const methods = useForm<ProfileFormValues>({
    mode: 'onChange',
    resetOptions: { keepDirtyValues: true },
    values: {
      full_name: user?.name ?? [userSignUp?.first_name, userSignUp?.last_name].filter(Boolean).join(' '),
      company_name: userSignUp?.company_name ?? '',
      phone: phone ?? '',
    },
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    const [firstName, ...lastName] = data.full_name.trim().split(/\s+/)
    let organizationId = createdOrganizationId

    try {
      if (!organizationId) {
        await createUserSignUp({
          ...userSignUp,
          first_name: firstName,
          last_name: lastName.join(' '),
          user_email: userEmail,
          company_name: data.company_name.trim(),
          type_of_use: userSignUp?.type_of_use ?? TypeOfUseEnum.WORK,
          phone: data.phone,
          qovery_usage: userSignUp?.qovery_usage ?? '',
          current_step: 'project',
        })

        await refetchUserSignUp({ throwOnError: true, cancelRefetch: false })

        const organization = await createOrganization({
          organizationRequest: {
            name: data.company_name.trim(),
            plan: selectedPlan,
            admin_emails: userEmail ? [userEmail] : [],
          },
        })
        organizationId = organization.id
        setCreatedOrganizationId(organization.id)
      }

      try {
        await getAccessTokenSilently({ cacheMode: 'off' })
      } catch (error) {
        toastError(error as Error)
        return
      }

      if (!projectCreated) {
        await createProject({ organizationId, projectRequest: { name: 'main' } })
        setProjectCreated(true)
      }

      posthog.capture('onboarding-tailor-experience-completed', {
        first_name: firstName,
        last_name: lastName.join(' '),
        company_name: data.company_name.trim(),
        phone: data.phone,
      })

      posthog.capture('onboarding-organization-created', {
        plan: selectedPlan,
        first_name: firstName,
        last_name: lastName.join(' '),
        company_name: data.company_name.trim(),
        phone: data.phone,
        use_cases: userSignUp?.user_questions ? userSignUp.user_questions.split(',') : [],
      })
      pushToDataLayer({ event: 'onboarding-organization-created', plan: selectedPlan })
      navigate({ to: '/organization/$organizationId/overview', params: { organizationId } })
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <FormProvider {...methods}>
      <StepPersonalize onSubmit={onSubmit} readOnly={!!createdOrganizationId} />
    </FormProvider>
  )
}
