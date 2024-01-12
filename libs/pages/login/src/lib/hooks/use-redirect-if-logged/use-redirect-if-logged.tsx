import { useAuth0 } from '@auth0/auth0-react'
import { useGTMDispatch } from '@elgorditosalsero/react-gtm-hook'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useOrganizations } from '@qovery/domains/organizations/feature'
import { useProjects } from '@qovery/domains/projects/feature'
import { fetchUserSignUp } from '@qovery/domains/users/data-access'
import { useAuth } from '@qovery/shared/auth'
import {
  ONBOARDING_PERSONALIZE_URL,
  ONBOARDING_PROJECT_URL,
  ONBOARDING_URL,
  ORGANIZATION_URL,
  OVERVIEW_URL,
} from '@qovery/shared/routes'
import { type AppDispatch } from '@qovery/state/store'
import {
  getCurrentOrganizationIdFromStorage,
  getCurrentProjectIdFromStorage,
  getRedirectLoginUriFromStorage,
} from './utils/utils'

export function useRedirectIfLogged() {
  const navigate = useNavigate()
  const { createAuthCookies, user } = useAuth()
  const { isAuthenticated } = useAuth0()
  const dispatch = useDispatch<AppDispatch>()
  const sendDataToGTM = useGTMDispatch()
  const { data: organizations = [], isFetched: isFetchedOrganizations } = useOrganizations({
    enabled: isAuthenticated,
  })
  const { data: projects = [] } = useProjects({ organizationId: organizations[0]?.id })

  useEffect(() => {
    async function fetchData() {
      await createAuthCookies()

      if (!isFetchedOrganizations) {
        return
      }

      if (organizations.length > 0) {
        const organizationId = organizations[0].id
        if (projects.length > 0) navigate(OVERVIEW_URL(organizationId, projects[0].id))
        else navigate(ORGANIZATION_URL(organizationId))
      } else {
        const userSignUp = await dispatch(fetchUserSignUp()).unwrap()
        if (userSignUp.dx_auth) {
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

      if (redirectLoginUri) {
        navigate(redirectLoginUri)
        localStorage.removeItem('redirectLoginUri')
        return
      }

      if (currentOrganization && currentProject) {
        navigate(OVERVIEW_URL(currentOrganization, currentProject))
        return
      }

      fetchData()
    }
  }, [
    navigate,
    isAuthenticated,
    createAuthCookies,
    dispatch,
    sendDataToGTM,
    user?.email,
    organizations,
    projects,
    isFetchedOrganizations,
  ])
}

export default useRedirectIfLogged
