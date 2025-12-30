import { useAuth0 } from '@auth0/auth0-react'
import { Navigate, createFileRoute } from '@tanstack/react-router'
import { Container, OnboardingPersonalize } from '@qovery/pages/onboarding'

export const Route = createFileRoute('/_authenticated/onboarding/personalize')({
  component: Personalize,
})

function Personalize() {
  const { isAuthenticated } = useAuth0()

  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: '/' }} />
  }

  return (
    <Container params={{ '*': '/personalize' }}>
      <OnboardingPersonalize />
    </Container>
  )
}
