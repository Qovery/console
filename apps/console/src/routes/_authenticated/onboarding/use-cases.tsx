import { useAuth0 } from '@auth0/auth0-react'
import { Navigate, createFileRoute, useNavigate } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { Container, StepUseCases } from '@qovery/domains/onboarding/feature'
import { useCreateUserSignUp, useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/onboarding/use-cases')({
  component: UseCases,
})

function UseCases() {
  useDocumentTitle('Onboarding Use Cases - Qovery')
  const { isAuthenticated } = useAuth0()
  const navigate = useNavigate()
  const { data: userSignUp } = useUserSignUp()
  const { mutateAsync: createUserSignUp } = useCreateUserSignUp()

  const onSubmit = async (useCases: string[]) => {
    try {
      if (useCases.length > 0) {
        await createUserSignUp({
          ...userSignUp,
          user_questions: useCases.join(','),
          qovery_usage: userSignUp?.qovery_usage ?? '',
        })
      }

      posthog.capture('onboarding-use-cases-selected', {
        first_name: userSignUp?.first_name,
        last_name: userSignUp?.last_name,
        company_name: userSignUp?.company_name,
        phone: sessionStorage.getItem('onboarding_phone'),
        use_cases: useCases,
      })

      navigate({ to: '/onboarding/project' })
    } catch (error) {
      console.error(error)
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: '/' }} />
  }

  return (
    <Container>
      <StepUseCases onSubmit={onSubmit} onBack={() => navigate({ to: '/onboarding/personalize' })} />
    </Container>
  )
}
