import { useAuth0 } from '@auth0/auth0-react'
import { Navigate, createFileRoute, useNavigate } from '@tanstack/react-router'
import axios from 'axios'
import { useEffect } from 'react'
import { useOrganizations } from '@qovery/domains/organizations/feature'
import { useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { useAuth } from '@qovery/shared/auth'
import { getOnboardingEntryUrl } from '@qovery/shared/routes'
import { LoadingScreen } from '@qovery/shared/ui'
import { QOVERY_API } from '@qovery/shared/util-node-env'
import { useAuthInterceptor } from '@qovery/shared/utils'
import { consumePendingReturnTo } from '../../auth/auth0'

type Auth0CallbackSearch = {
  connection?: string
  error?: string
  error_description?: string
}

export const Route = createFileRoute('/login/auth0-callback')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): Auth0CallbackSearch => ({
    connection: (search.connection as string) || undefined,
    error: (search.error as string) || undefined,
    error_description: (search.error_description as string) || undefined,
  }),
})

function useRedirectIfLogged(connection?: string) {
  const navigate = useNavigate()
  const { authLogin } = useAuth()
  const { isAuthenticated } = useAuth0()
  const { data: organizations = [], isFetched: isFetchedOrganizations } = useOrganizations({
    enabled: isAuthenticated,
  })
  const { refetch: refetchUserSignUp } = useUserSignUp({ enabled: false })

  useEffect(() => {
    if (connection && !isAuthenticated) {
      const trimmed = connection.trim()
      const domainWithoutDots = trimmed.includes('.') ? trimmed.substring(0, trimmed.lastIndexOf('.')) : trimmed

      authLogin(domainWithoutDots).catch((error) => {
        console.error('Auto-connection failed:', error)
      })

      return
    }

    async function fetchData() {
      if (!isFetchedOrganizations) {
        return
      }

      // User has at least 1 organization attached
      if (organizations.length > 0) {
        const returnTo = consumePendingReturnTo()
        if (returnTo) {
          navigate({ to: returnTo })
        } else {
          navigate({ to: '/organization/$organizationId/overview', params: { organizationId: organizations[0]?.id } })
        }
      } else {
        const { data: userSignUp } = await refetchUserSignUp()
        navigate({ href: getOnboardingEntryUrl(userSignUp) })
      }
    }

    if (isAuthenticated) {
      fetchData()
    }
  }, [authLogin, connection, navigate, isAuthenticated, organizations, isFetchedOrganizations, refetchUserSignUp])
}

function PageRedirectLogin() {
  const { connection, error, error_description } = Route.useSearch()
  useAuthInterceptor(axios, QOVERY_API)
  useRedirectIfLogged(connection)

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
