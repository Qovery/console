import { useAuth0 } from '@auth0/auth0-react'
import { Navigate, createFileRoute, useNavigate } from '@tanstack/react-router'
import axios from 'axios'
import { useEffect } from 'react'
import { useOrganizations } from '@qovery/domains/organizations/feature'
import { useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { LoadingScreen } from '@qovery/shared/ui'
import { QOVERY_API } from '@qovery/shared/util-node-env'
import { useAuthInterceptor } from '@qovery/shared/utils'

type Auth0CallbackSearch = {
  error?: string
  error_description?: string
}

export const Route = createFileRoute('/login/auth0-callback')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): Auth0CallbackSearch => ({
    error: (search.error as string) || undefined,
    error_description: (search.error_description as string) || undefined,
  }),
})

function useRedirectIfLogged() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth0()
  const { data: organizations = [], isFetched: isFetchedOrganizations } = useOrganizations({
    enabled: isAuthenticated,
  })
  const { refetch: refetchUserSignUp } = useUserSignUp({ enabled: false })

  useEffect(() => {
    async function fetchData() {
      if (!isFetchedOrganizations) {
        return
      }

      // User has at least 1 organization attached
      if (organizations.length > 0) {
        navigate({ to: '/organization/$organizationId/overview', params: { organizationId: organizations[0]?.id } })
      } else {
        const { data: userSignUp } = await refetchUserSignUp()
        if (userSignUp?.dx_auth) {
          navigate({ to: '/onboarding/project' })
        } else {
          navigate({ to: '/onboarding/personalize' })
        }
      }
    }

    if (isAuthenticated) {
      fetchData()
    }
  }, [navigate, isAuthenticated, organizations, isFetchedOrganizations, refetchUserSignUp])
}

function PageRedirectLogin() {
  const { error, error_description } = Route.useSearch()
  useAuthInterceptor(axios, QOVERY_API)
  useRedirectIfLogged()

  if (error != null) {
    const errorDescription = error_description || 'No description available'

    // Handle specific OIDC / SAML issue: the domain provided by the user doesn't exist on Auth0 side
    if (error === 'invalid_request' && errorDescription.includes('')) {
      sessionStorage.setItem('auth0_error', 'Invalid Enterprise SSO Domain Name')
      sessionStorage.setItem('auth0_error_description', 'The domain name provided is not authorized')
    }

    return <Navigate to="/login" search={{ redirect: '/' }} />
  }

  return <LoadingScreen />
}

function RouteComponent() {
  return <PageRedirectLogin />
}
