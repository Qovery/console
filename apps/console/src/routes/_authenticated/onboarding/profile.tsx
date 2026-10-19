import { useAuth0 } from '@auth0/auth0-react'
import { Navigate, createFileRoute } from '@tanstack/react-router'
import { Container, OnboardingProfile } from '@qovery/domains/onboarding/feature'
import { UserMenu } from '../../../app/components/header/user-menu/user-menu'

export const Route = createFileRoute('/_authenticated/onboarding/profile')({
  component: Profile,
})

function Profile() {
  const { isAuthenticated } = useAuth0()

  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: '/' }} />
  }

  return (
    <Container profileUserMenu={<UserMenu />}>
      <OnboardingProfile />
    </Container>
  )
}
