import { useAuth0 } from '@auth0/auth0-react'
import { Navigate, createFileRoute, useNavigate } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { TypeOfUseEnum } from 'qovery-typescript-axios'
import { useContext } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Container, ContextOnboarding, StepPersonalize } from '@qovery/domains/onboarding/feature'
import { useCreateUserSignUp, useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { useAuth } from '@qovery/shared/auth'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/onboarding/personalize')({
  component: Personalize,
})

function Personalize() {
  useDocumentTitle('Onboarding Personalize - Qovery')
  const { isAuthenticated } = useAuth0()
  const navigate = useNavigate()
  const { user } = useAuth0()
  const { authLogout } = useAuth()
  const { setContextValue } = useContext(ContextOnboarding)
  const { data: userSignUp } = useUserSignUp()
  const { mutateAsync: createUserSignUp } = useCreateUserSignUp()

  const methods = useForm<{
    first_name: string
    last_name: string
    user_email: string
    company_name?: string
    type_of_use: TypeOfUseEnum
    phone: string
  }>({
    mode: 'onChange',
    defaultValues: {
      first_name: userSignUp?.first_name ? userSignUp.first_name : user?.name?.split(' ')[0],
      last_name: userSignUp?.last_name ? userSignUp.last_name : user?.name?.split(' ')[1],
      user_email: userSignUp?.user_email ? userSignUp.user_email : user?.email,
      company_name: userSignUp?.company_name ?? '',
      type_of_use: userSignUp?.type_of_use ?? TypeOfUseEnum.WORK,
      phone: '',
    },
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!data) return

    try {
      await createUserSignUp({
        ...userSignUp,
        first_name: data.first_name,
        last_name: data.last_name,
        user_email: data.user_email,
        company_name: data.company_name,
        type_of_use: data.type_of_use,
        phone: data.phone,
        qovery_usage: userSignUp?.qovery_usage ?? '',
        current_step: userSignUp?.current_step ?? 'personalize',
      })

      if (data.phone) setContextValue?.({ phone: data.phone })

      posthog.capture('onboarding-tailor-experience-completed', {
        first_name: data.first_name,
        last_name: data.last_name,
        company_name: data.company_name,
        phone: data.phone,
      })

      navigate({ to: '/onboarding/use-cases' })
    } catch (error) {
      console.error(error)
    }
  })

  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: '/' }} />
  }

  return (
    <Container>
      <FormProvider {...methods}>
        <StepPersonalize onSubmit={onSubmit} authLogout={authLogout} />
      </FormProvider>
    </Container>
  )
}
