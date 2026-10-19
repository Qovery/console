import { useNavigate } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { TypeOfUseEnum } from 'qovery-typescript-axios'
import { useContext, useRef, useState } from 'react'
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
import { type PendingOnboarding, readPendingOnboarding, savePendingOnboarding } from '../utils/pending-onboarding'

export function OnboardingPersonalize() {
  const auth = useAuth()
  return <OnboardingPersonalizeForm key={auth.user?.sub} auth={auth} />
}

function OnboardingPersonalizeForm({ auth }: { auth: ReturnType<typeof useAuth> }) {
  useDocumentTitle('Onboarding Personalize - Qovery')
  const navigate = useNavigate()
  const { user, getAccessTokenSilently } = auth

  const { selectedPlan, phone, organization_name } = useContext(ContextOnboarding)
  const submissionInFlight = useRef(false)
  const [submitting, setSubmitting] = useState(false)
  // Keep restored defaults stable: saving progress must not reset a running submission.
  const [initialPending] = useState(() => readPendingOnboarding(user?.sub))
  const [pending, setPending] = useState(initialPending)
  const updatePending = (value: PendingOnboarding | undefined) => {
    savePendingOnboarding(user?.sub, value)
    setPending(value)
  }
  const { mutateAsync: createProject } = useCreateProject({ silently: true })
  const { mutateAsync: createOrganization } = useCreateOrganization()
  const { data: userSignUp, refetch: refetchUserSignUp } = useUserSignUp()
  const { mutateAsync: createUserSignUp } = useCreateUserSignUp()

  const defaultEmail = user?.email?.trim() || userSignUp?.user_email?.trim() || ''

  const methods = useForm<ProfileFormValues>({
    mode: 'onChange',
    resetOptions: { keepDirtyValues: true },
    defaultValues: initialPending
      ? { ...initialPending.profile, user_email: initialPending.profile.user_email || defaultEmail }
      : undefined,
    values: initialPending
      ? undefined
      : {
          full_name: user?.name?.trim() || [userSignUp?.first_name, userSignUp?.last_name].filter(Boolean).join(' '),
          user_email: defaultEmail,
          organization_name,
          company_name: userSignUp?.company_name ?? '',
          phone: phone ?? '',
        },
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    const userEmail = data.user_email.trim()
    if (!userEmail || submissionInFlight.current) return

    submissionInFlight.current = true
    setSubmitting(true)

    const [firstName, ...lastName] = data.full_name.trim().split(/\s+/)
    let organizationId = pending?.organizationId
    let progress = pending

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
            name: data.organization_name.trim(),
            plan: selectedPlan,
            admin_emails: [userEmail],
          },
        })
        organizationId = organization.id
        progress = { organizationId: organization.id, profile: data }
        updatePending(progress)
      }

      try {
        await getAccessTokenSilently({ cacheMode: 'off' })
      } catch (error) {
        toastError(error as Error)
        return
      }

      if (!progress?.projectId) {
        const project = await createProject({ organizationId, projectRequest: { name: 'main' } })
        progress = { organizationId, profile: data, projectId: project.id }
        updatePending(progress)
      }

      if (!progress.completionTracked) {
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
        updatePending({ ...progress, completionTracked: true })
      }
      await navigate({ to: '/organization/$organizationId/overview', params: { organizationId } })
      updatePending(undefined)
    } catch (error) {
      console.error(error)
    } finally {
      submissionInFlight.current = false
      setSubmitting(false)
    }
  })

  return (
    <FormProvider {...methods}>
      <StepPersonalize onSubmit={onSubmit} loading={submitting} readOnly={!!pending} />
    </FormProvider>
  )
}
