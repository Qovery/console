import { useNavigate } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { TypeOfUseEnum } from 'qovery-typescript-axios'
import { useContext } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useCreateUserSignUp, useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { useAuth } from '@qovery/shared/auth'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ContextOnboarding } from '../container/container'
import { isPersonalEmail } from '../step-personalize/personal-email-domains'
import { type ProfileFormValues, StepPersonalize } from '../step-personalize/step-personalize'

export function OnboardingPersonalize() {
  useDocumentTitle('Onboarding Personalize - Qovery')
  const navigate = useNavigate()
  const { user } = useAuth()

  const { organization_name, phone, setContextValue } = useContext(ContextOnboarding)
  const { data: userSignUp, refetch: refetchUserSignUp } = useUserSignUp()
  const { mutateAsync: createUserSignUp } = useCreateUserSignUp()

  const defaultEmail = [user?.email, userSignUp?.user_email].find((email) => email && !isPersonalEmail(email)) ?? ''

  const methods = useForm<ProfileFormValues>({
    mode: 'onChange',
    resetOptions: { keepDirtyValues: true },
    values: {
      full_name: user?.name ?? [userSignUp?.first_name, userSignUp?.last_name].filter(Boolean).join(' '),
      user_email: defaultEmail,
      company_name: userSignUp?.company_name ?? '',
      organization_name,
      phone: phone ?? '',
    },
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    const [firstName, ...lastName] = data.full_name.trim().split(/\s+/)

    try {
      await createUserSignUp({
        ...userSignUp,
        first_name: firstName,
        last_name: lastName.join(' '),
        user_email: data.user_email,
        company_name: data.company_name.trim(),
        type_of_use: userSignUp?.type_of_use ?? TypeOfUseEnum.WORK,
        phone: data.phone,
        qovery_usage: userSignUp?.qovery_usage ?? '',
        current_step: userSignUp?.current_step ?? 'personalize',
      })

      await refetchUserSignUp({ throwOnError: true, cancelRefetch: false })

      setContextValue?.({ organization_name: data.organization_name.trim(), phone: data.phone })

      posthog.capture('onboarding-tailor-experience-completed', {
        first_name: firstName,
        last_name: lastName.join(' '),
        company_name: data.company_name.trim(),
        phone: data.phone,
      })

      navigate({ to: '/onboarding/use-cases' })
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <FormProvider {...methods}>
      <StepPersonalize onSubmit={onSubmit} needsProfessionalEmail={!defaultEmail} />
    </FormProvider>
  )
}
