import { useAuth0 } from '@auth0/auth0-react'
import { Navigate, createFileRoute } from '@tanstack/react-router'
import { Container, OnboardingProject } from '@qovery/domains/onboarding/feature'

export const Route = createFileRoute('/_authenticated/onboarding/project')({
  component: Project,
})

function Project() {
  const { isAuthenticated } = useAuth0()

  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: '/' }} />
  }

  return (
    <Container>
      <OnboardingProject />
    </Container>
  )
}
