import { Organization, Project } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { fetchOrganization } from '@qovery/domains/organization'
import { fetchProjects } from '@qovery/domains/projects'
import { useAuth } from '@qovery/shared/auth'
import { ONBOARDING_URL, ORGANIZATION_URL, OVERVIEW_URL } from '@qovery/shared/router'
import { AppDispatch } from '@qovery/store/data'
import {
  getCurrentOrganizationIdFromStorage,
  getCurrentProjectIdFromStorage,
  getRedirectLoginUriFromStorage,
} from './utils/utils'

export function useRedirectIfLogged() {
  const navigate = useNavigate()
  const { createAuthCookies, checkIsAuthenticated } = useAuth()
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const isOnboarding = process.env?.['NX_ONBOARDING'] === 'true'
    async function fetchData() {
      let organization: Organization[] = []

      try {
        organization = await dispatch(fetchOrganization()).unwrap()
      } catch (e) {
        console.warn(e)
      }

      await createAuthCookies()

      if (organization.length > 0) {
        const organizationId = organization[0].id
        const projects: Project[] = await dispatch(fetchProjects({ organizationId })).unwrap()
        if (projects.length > 0) navigate(OVERVIEW_URL(organizationId, projects[0].id))
        else navigate(ORGANIZATION_URL(organizationId))
      }
      if (isOnboarding && organization.length === 0) {
        navigate(ONBOARDING_URL)
      }
      // if (isOnboarding && organization.length > 0) {
      //   window.location.replace(`${process.env['NX_URL'] || 'https://console.qovery.com'}?redirectLoginV3`)
      // }
    }
    if (checkIsAuthenticated) {
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
  }, [navigate, checkIsAuthenticated, createAuthCookies, dispatch])
}

export default useRedirectIfLogged
