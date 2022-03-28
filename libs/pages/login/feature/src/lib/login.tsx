import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { LayoutLogin, Login } from '@console/pages/login/ui'
import { ONBOARDING_URL, useAuth, useDocumentTitle, AuthEnum, OVERVIEW_URL } from '@console/shared/utils'
import { useOrganization } from '@console/domains/organization'

export function LoginPage() {
  const navigate = useNavigate()
  const { authLogin, createAuthCookies, checkIsAuthenticated } = useAuth()
  const { getOrganization } = useOrganization()

  useDocumentTitle('Login - Qovery')

  const isOnboarding = process.env['NX_ONBOARDING'] === 'true'

  const onClickAuthLogin = async (provider: string) => {
    await authLogin(provider)
  }

  useEffect(() => {
    async function fetchData() {
      const organization = await getOrganization()
      await createAuthCookies()

      if (!isOnboarding && organization.payload.length > 0) {
        navigate(OVERVIEW_URL)
      }
      if (isOnboarding && organization.payload.length === 0) {
        navigate(ONBOARDING_URL)
      }
      if (isOnboarding && organization.payload.length > 0) {
        window.location.replace(`${process.env['NX_URL'] || 'https://console.qovery.com'}?redirectLoginV3`)
      }
    }
    if (checkIsAuthenticated) {
      fetchData()
    }
  }, [getOrganization, navigate, isOnboarding, checkIsAuthenticated, createAuthCookies])

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

export default LoginPage
