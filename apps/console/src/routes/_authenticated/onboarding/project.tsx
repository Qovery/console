import { useAuth0 } from '@auth0/auth0-react'
import { Navigate, createFileRoute } from '@tanstack/react-router'
import { Container, OnboardingProject } from '@qovery/domains/onboarding/feature'

type OnboardingProjectSearch = {
  previousUrl?: string
}

function isInternalPath(previousUrl: unknown): previousUrl is string {
  return typeof previousUrl === 'string' && previousUrl.startsWith('/') && !previousUrl.startsWith('//')
}

export const Route = createFileRoute('/_authenticated/onboarding/project')({
  validateSearch: (search): OnboardingProjectSearch => ({
    previousUrl: isInternalPath(search.previousUrl) ? search.previousUrl : undefined,
  }),
  component: Project,
})

function Project() {
  const { isAuthenticated } = useAuth0()
  const search = Route.useSearch()

  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: '/' }} />
  }

  return (
    <Container>
      <OnboardingProject previousUrl={search.previousUrl} />
    </Container>
  )
}
