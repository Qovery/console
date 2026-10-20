import { useNavigate } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { PlanEnum, TypeOfUseEnum } from 'qovery-typescript-axios'
import { useRef, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useCreateOrganization, useEditOrganization, useOrganization } from '@qovery/domains/organizations/feature'
import { useCreateProject } from '@qovery/domains/projects/feature'
import { useCreateUserSignUp, useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { useAuth } from '@qovery/shared/auth'
import { InputText, toast, toastError } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { OnboardingForm } from '../onboarding-form/onboarding-form'
import { pushToDataLayer } from '../utils/data-layer'
import {
  type PendingOnboarding,
  type ProfileFormValues,
  readPendingOnboarding,
  savePendingOnboarding,
} from '../utils/pending-onboarding'
import { isPersonalEmail } from '../utils/personal-email-domains'

export function OnboardingProfile() {
  const auth = useAuth()
  return <OnboardingProfileForm key={auth.user?.sub} auth={auth} />
}

function OnboardingProfileForm({ auth }: { auth: ReturnType<typeof useAuth> }) {
  useDocumentTitle('Onboarding Profile - Qovery')
  const navigate = useNavigate()
  const { user, getAccessTokenSilently } = auth

  const selectedPlan = PlanEnum.BUSINESS_2025
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
  const { mutateAsync: editOrganization } = useEditOrganization()
  const { refetch: refetchOrganization } = useOrganization({
    organizationId: pending?.organizationId ?? '',
    enabled: false,
  })
  const { data: userSignUp, refetch: refetchUserSignUp } = useUserSignUp()
  const { mutateAsync: createUserSignUp } = useCreateUserSignUp({ sendToCargo: !pending?.organizationId })

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
          organization_name: userSignUp?.company_name || '',
          company_name: userSignUp?.company_name ?? '',
          phone: '',
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

    const saveProfile = async () => {
      await createUserSignUp({
        ...userSignUp,
        first_name: firstName,
        last_name: lastName.join(' '),
        user_email: userEmail,
        company_name: data.company_name.trim(),
        type_of_use: userSignUp?.type_of_use ?? TypeOfUseEnum.WORK,
        phone: data.phone,
        qovery_usage: userSignUp?.qovery_usage ?? '',
        current_step: userSignUp?.current_step ?? 'project',
      })

      await refetchUserSignUp({ throwOnError: true, cancelRefetch: false })
    }

    try {
      if (progress && organizationId) {
        const previousProfile = progress.profile
        const profileChanged = (['full_name', 'user_email', 'company_name', 'phone'] as const).some(
          (field) => data[field].trim() !== previousProfile[field].trim()
        )
        if (profileChanged) {
          await saveProfile()
          progress = { ...progress, profile: { ...data, organization_name: progress.profile.organization_name } }
          updatePending(progress)
        }
        if (data.organization_name.trim() !== progress.profile.organization_name.trim()) {
          const { data: organization } = await refetchOrganization({ throwOnError: true, cancelRefetch: false })
          if (!organization) {
            toastError(new Error('Unable to load your organization. Please try again.'))
            return
          }
          await editOrganization({
            organizationId,
            organizationRequest: {
              ...organization,
              description: organization.description ?? '',
              name: data.organization_name.trim(),
            },
          })
          progress = { ...progress, profile: { ...progress.profile, organization_name: data.organization_name } }
          updatePending(progress)
        }
      }

      // Back returns to the completed profile; only resume the next step.
      if (progress?.projectId && progress.completionTracked) {
        await navigate({
          to: '/onboarding/organization/$organizationId/cluster',
          params: { organizationId: progress.organizationId },
        })
        return
      }

      if (!organizationId) {
        await saveProfile()

        const organization = await createOrganization({
          organizationRequest: {
            name: data.organization_name.trim() || data.company_name.trim(),
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
      await navigate({ to: '/onboarding/organization/$organizationId/cluster', params: { organizationId } })
      toast('success', 'Your organization has been created')
    } catch (error) {
      console.error(error)
    } finally {
      submissionInFlight.current = false
      setSubmitting(false)
    }
  })

  return (
    <FormProvider {...methods}>
      <OnboardingForm
        title="Create your profile"
        description="Tell us more about yourself"
        onSubmit={onSubmit}
        loading={submitting || methods.formState.isSubmitting}
        disabled={!methods.formState.isValid}
      >
        <Controller
          name="full_name"
          control={methods.control}
          rules={{
            validate: (value) => value.trim().split(/\s+/).length >= 2 || 'Please enter your first and last name.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText {...field} readOnly={submitting} label="Full name" autoComplete="name" error={error?.message} />
          )}
        />
        <Controller
          name="user_email"
          control={methods.control}
          rules={{
            required: 'Please enter your work email.',
            validate: (value) => !isPersonalEmail(value.trim()) || 'Please enter your professional email address.',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Please enter a valid email address.',
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              {...field}
              readOnly={submitting}
              type="email"
              label="Work email"
              autoComplete="email"
              error={
                isPersonalEmail(field.value.trim()) ? 'Please enter your professional email address.' : error?.message
              }
            />
          )}
        />
        <Controller
          name="company_name"
          control={methods.control}
          rules={{ validate: (value) => !!value.trim() || 'Please enter your company name.' }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              {...field}
              readOnly={submitting}
              onChange={(event) => {
                const organizationName = methods.getValues('organization_name')
                if (!pending && (!organizationName || organizationName === field.value)) {
                  methods.setValue('organization_name', event.target.value, { shouldDirty: true, shouldValidate: true })
                }
                field.onChange(event)
              }}
              label="Company name"
              autoComplete="organization"
              error={error?.message}
            />
          )}
        />
        <Controller
          name="phone"
          control={methods.control}
          rules={{
            pattern: {
              value: /^(?=(?:\D*\d){7})[\d\s+\-()]+$/,
              message: 'Please enter a valid phone number.',
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              {...field}
              readOnly={submitting}
              label="Phone number (optional)"
              autoComplete="tel"
              error={error?.message}
            />
          )}
        />
        <Controller
          name="organization_name"
          control={methods.control}
          rules={{
            validate: (value) => !!value.trim() || 'Please enter your organization name.',
            pattern: {
              value: /^(?!\s*test\s*$)/i,
              message: 'Please choose an organization name other than "test".',
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              {...field}
              readOnly={submitting}
              label="Organization name"
              error={
                field.value.trim().toLowerCase() === 'test'
                  ? 'Please choose an organization name other than "test".'
                  : error?.message
              }
            />
          )}
        />
      </OnboardingForm>
    </FormProvider>
  )
}
