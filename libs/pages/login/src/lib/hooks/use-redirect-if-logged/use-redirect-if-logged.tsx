import { useAuth0 } from '@auth0/auth0-react'
import { useGTMDispatch } from '@elgorditosalsero/react-gtm-hook'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useOrganizations } from '@qovery/domains/organizations/feature'
import { useProjects } from '@qovery/domains/projects/feature'
import { useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { useAuth } from '@qovery/shared/auth'
import {
  ONBOARDING_PERSONALIZE_URL,
  ONBOARDING_PROJECT_URL,
  ONBOARDING_URL,
  ORGANIZATION_URL,
  OVERVIEW_URL,
} from '@qovery/shared/routes'
import {
  getCurrentOrganizationIdFromStorage,
  getCurrentProjectIdFromStorage,
  getCurrentProvider,
  getRedirectLoginUriFromStorage,
} from './utils/utils'

const extractOrganizationIdFromPath = (path: string) => {
  const match = path.match(/\/organization\/([^/]+)/)
  return match?.[1]
}

export function useRedirectIfLogged() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, authLogin } = useAuth()
  const { isAuthenticated } = useAuth0()
  const sendDataToGTM = useGTMDispatch()
  const { data: organizations = [], isFetched: isFetchedOrganizations } = useOrganizations({
    enabled: isAuthenticated,
  })
  const { data: projects = [] } = useProjects({ organizationId: organizations[0]?.id })
  const { refetch: refetchUserSignUp } = useUserSignUp({ enabled: false })

  useEffect(() => {
    const connectionParam = searchParams.get('connection')
    if (connectionParam && !isAuthenticated) {
      const domainWithoutDots = connectionParam.trim().replace(/\./g, '')

      // Trigger the auth login with the domain from URL parameter
      authLogin(domainWithoutDots).catch((error) => {
        console.error('Auto-connection failed:', error)
      })

      return // Exit early to prevent further processing
    }

    async function fetchData() {
      if (!isFetchedOrganizations) {
        return
      }

      // User has at least 1 organization attached
      if (organizations.length > 0) {
        const organizationId = organizations[0].id
        if (projects.length > 0) navigate(OVERVIEW_URL(organizationId, projects[0].id))
        else navigate(ORGANIZATION_URL(organizationId))
      } else {
        const { data: userSignUp } = await refetchUserSignUp()
        if (userSignUp?.dx_auth) {
          navigate(ONBOARDING_URL + ONBOARDING_PROJECT_URL)
        } else {
          sendDataToGTM({ event: 'new_signup', value: user?.email })
          navigate(ONBOARDING_URL + ONBOARDING_PERSONALIZE_URL)
        }
      }
    }

    if (isAuthenticated) {
      const currentOrganization = getCurrentOrganizationIdFromStorage()
      const currentProject = getCurrentProjectIdFromStorage()
      const redirectLoginUri = getRedirectLoginUriFromStorage()
      const currentProvider = getCurrentProvider()

      if (currentProvider === user?.sub) {
        if (redirectLoginUri) {
          const organizationIdFromRedirect = extractOrganizationIdFromPath(redirectLoginUri)
          const organizationExists =
            !organizationIdFromRedirect ||
            organizations.some((organization) => organization.id === organizationIdFromRedirect)

          if (organizationExists) {
            navigate(redirectLoginUri)
            localStorage.removeItem('redirectLoginUri')
            return
          }

          // The stored redirect points to an organization that no longer exists (e.g. last org deleted),
          // so we drop it and rely on the standard routing logic instead of looping back to a dead URL.
          localStorage.removeItem('redirectLoginUri')
        }

        // Only honor cached org/project IDs when the freshly fetched organizations still contain the stored org.
        // This prevents redirecting to deleted organizations (e.g. after wiping the user's last org).
        const storedOrgExists = organizations.some((organization) => organization.id === currentOrganization)
        if (currentOrganization && currentProject && storedOrgExists) {
          navigate(OVERVIEW_URL(currentOrganization, currentProject))
          return
        }
      }

      localStorage.removeItem('currentOrganizationId')
      localStorage.removeItem('currentProjectId')
      fetchData()
    }
  }, [
    navigate,
    isAuthenticated,
    sendDataToGTM,
    refetchUserSignUp,
    user,
    organizations,
    projects,
    isFetchedOrganizations,
  ])
}

export default useRedirectIfLogged
