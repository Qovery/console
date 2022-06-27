import { useEffect } from 'react'
import { useAuth } from '@console/shared/auth'
import { Organization, Project } from 'qovery-typescript-axios'
import { fetchOrganization } from '@console/domains/organization'
import { fetchProjects } from '@console/domains/projects'
import { ONBOARDING_URL, OVERVIEW_URL } from '@console/shared/router'
import { useNavigate } from 'react-router'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@console/store/data'

export function useRedirectIfLogged() {
  const navigate = useNavigate()
  const { createAuthCookies, checkIsAuthenticated } = useAuth()
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const isOnboarding = process.env?.['NX_ONBOARDING'] === 'true'

    async function fetchData() {
      const organization: Organization[] = await dispatch(fetchOrganization()).unwrap()

      await createAuthCookies()

      if (organization.length > 0) {
        const organizationId = organization[0].id
        const projects: Project[] = await dispatch(fetchProjects({ organizationId })).unwrap()
        if (projects.length > 0) navigate(OVERVIEW_URL(organizationId, projects[0].id))
      }
      if (isOnboarding && organization.length === 0) {
        navigate(ONBOARDING_URL)
      }
      // if (isOnboarding && organization.length > 0) {
      //   window.location.replace(`${process.env['NX_URL'] || 'https://console.qovery.com'}?redirectLoginV3`)
      // }
    }
    if (checkIsAuthenticated) {
      fetchData()
    }
  }, [navigate, checkIsAuthenticated, createAuthCookies, dispatch])
}

export default useRedirectIfLogged
