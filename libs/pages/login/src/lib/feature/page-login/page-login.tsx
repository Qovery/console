import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch } from 'react-redux'
import { Organization, Project } from 'qovery-typescript-axios'
import { useDocumentTitle } from '@console/shared/utils'
import { ONBOARDING_URL, OVERVIEW_URL } from '@console/shared/router'
import { AuthEnum, useAuth } from '@console/shared/auth'
import { fetchOrganization } from '@console/domains/organization'
import { fetchProjects } from '@console/domains/projects'
import { AppDispatch } from '@console/store/data'
import LayoutLogin from '../../ui/layout-login/layout-login'
import Login from '../../ui/login/login'
// import posthog from 'posthog-js'

export function PageLoginFeature() {
  const navigate = useNavigate()
  const { authLogin, createAuthCookies, checkIsAuthenticated } = useAuth()
  const dispatch = useDispatch<AppDispatch>()

  useDocumentTitle('Login - Qovery')

  const onClickAuthLogin = async (provider: string) => {
    await authLogin(provider)
  }

  useEffect(() => {
    // const isOnboarding = posthog && posthog.isFeatureEnabled('v3-onboarding')
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
      // if (isOnboarding && organization.payload.length > 0) {
      //  window.location.replace(`${process.env['NX_URL'] || 'https://console.qovery.com'}?redirectLoginV3`)
      // }
    }
    if (checkIsAuthenticated) {
      fetchData()
    }
  }, [navigate, checkIsAuthenticated, createAuthCookies, dispatch])

  return (
    <LayoutLogin>
      <Login
        onClickAuthLogin={onClickAuthLogin}
        githubType={AuthEnum.GITHUB}
        gitlabType={AuthEnum.GITLAB}
        bitbucketType={AuthEnum.BITBUCKET}
      />
    </LayoutLogin>
  )
}

export default PageLoginFeature
