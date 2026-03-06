import { useAuth0 } from '@auth0/auth0-react'
import { Navigate, createFileRoute } from '@tanstack/react-router'
import { Container, OnboardingPlans } from '@qovery/domains/onboarding/feature'

export const Route = createFileRoute('/_authenticated/onboarding/plans')({
  component: Plans,
})

function Plans() {
  const { isAuthenticated } = useAuth0()

  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: '/' }} />
  }

  return (
    <Container>
      <OnboardingPlans />
    </Container>
  )
}
