import { useAuth0 } from '@auth0/auth0-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import axios from 'axios'
import { useEffect } from 'react'
import { useOrganizations } from '@qovery/domains/organizations/feature'
import { useProjects } from '@qovery/domains/projects/feature'
import { useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { useAuth } from '@qovery/shared/auth'
import { LoadingScreen } from '@qovery/shared/ui'
import { QOVERY_API } from '../../../../../libs/shared/util-node-env/src'
import { useAuthInterceptor } from '../../../../../libs/shared/utils/src/lib/http/interceptors/auth-interceptor/auth-interceptor'

export const Route = createFileRoute('/login/auth0-callback')({
  component: RouteComponent,
})

function useRedirectIfLogged() {
  const navigate = useNavigate()
  const searchParams = Route.useSearch()
  console.log('🚀 ~ useRedirectIfLogged ~ searchParams:', searchParams)
  const { user } = useAuth()
  console.log('🚀 ~ useRedirectIfLogged ~ user:', user)
  const { isAuthenticated, user: auth0User } = useAuth0()
  console.log('🚀 ~ useRedirectIfLogged ~ isAuthenticated:', isAuthenticated)
  console.log('🚀 ~ useRedirectIfLogged ~ auth0User:', auth0User)
  // const sendDataToGTM = useGTMDispatch()
  const { data: organizations = [], isFetched: isFetchedOrganizations } = useOrganizations({
    enabled: isAuthenticated,
  })
  console.log('🚀 ~ useRedirectIfLogged ~ organizations:', organizations)
  const { data: projects = [] } = useProjects({ organizationId: organizations[0]?.id })
  console.log('🚀 ~ useRedirectIfLogged ~ projects:', projects)
  const { refetch: refetchUserSignUp } = useUserSignUp({ enabled: false })

  useEffect(() => {
    // const connectionParam = searchParams.get('connection')
    // if (connectionParam && !isAuthenticated) {
    //   const domainWithoutDots = connectionParam.trim().replace(/\./g, '')

    //   // Trigger the auth login with the domain from URL parameter
    //   authLogin(domainWithoutDots).catch((error) => {
    //     console.error('Auto-connection failed:', error)
    //   })

    //   return // Exit early to prevent further processing
    // }

    async function fetchData() {
      if (!isFetchedOrganizations) {
        return
      }

      // User has at least 1 organization attached
      if (organizations.length > 0) {
        const organizationId = organizations[0].id
        navigate({ to: '/organization/$orgId/overview', params: { orgId: organizationId } })
      }
      // else {
      // const { data: userSignUp } = await refetchUserSignUp()
      // if (userSignUp?.dx_auth) {
      //   navigate(ONBOARDING_URL + ONBOARDING_PROJECT_URL)
      // } else {
      //   // sendDataToGTM({ event: 'new_signup', value: user?.email })
      //   navigate(ONBOARDING_URL + ONBOARDING_PERSONALIZE_URL)
      // }
      // }
    }

    if (isAuthenticated) {
      // const currentOrganization = getCurrentOrganizationIdFromStorage()
      // const currentProject = getCurrentProjectIdFromStorage()
      // // const redirectLoginUri = getRedirectLoginUriFromStorage()
      // const currentProvider = getCurrentProvider()

      // if (currentProvider === user?.sub) {
      //   // if (redirectLoginUri) {
      //   //   navigate(redirectLoginUri)
      //   //   localStorage.removeItem('redirectLoginUri')
      //   //   return
      //   // }

      //   if (currentOrganization && currentProject) {
      //     navigate(OVERVIEW_URL(currentOrganization, currentProject))
      //     return
      //   }
      // }

      // localStorage.removeItem('currentOrganizationId')
      // localStorage.removeItem('currentProjectId')
      fetchData()
    }
  }, [navigate, isAuthenticated, refetchUserSignUp, user, organizations, projects, isFetchedOrganizations])
}

function PageRedirectLogin() {
  useAuthInterceptor(axios, QOVERY_API)
  useRedirectIfLogged()

  // const error = params.error
  // if (error != null) {
  //   const errorDescription = params.error_description || 'No description available'

  //   // Handle specific OIDC / SAML issue: the domain provided by the user doesn't exist on Auth0 side
  //   if (error === 'invalid_request' && errorDescription.includes('')) {
  //     sessionStorage.setItem('auth0_error', 'Invalid Enterprise SSO Domain Name')
  //     sessionStorage.setItem('auth0_error_description', 'The domain name provided is not authorized')
  //   }

  //   return <Navigate to="/login" />
  // }

  return <LoadingScreen />
}

function RouteComponent() {
  return <PageRedirectLogin />
}
