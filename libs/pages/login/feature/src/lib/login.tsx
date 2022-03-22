import { Navigate } from 'react-router'
import { LayoutLogin, Login } from '@console/pages/login/ui'
import { ONBOARDING_PERSONALIZE_URL, ONBOARDING_URL, useAuth, useDocumentTitle, AuthEnum } from '@console/shared/utils'
import { useOrganization } from '@console/domains/organization'
import { useEffect, useState } from 'react'

export function LoginPage() {
  const { authLogin, isAuthenticated, createAuthCookies } = useAuth()
  const { organization, getOrganization } = useOrganization()
  const [userWithOnboarding, setUserWithOnboarding] = useState(false)

  useDocumentTitle('Login - Qovery')

  useEffect(() => {
    async function fetchData() {
      await getOrganization()

      if (isAuthenticated && organization.length > 0) {
        await createAuthCookies()
        window.location.replace('https://console-staging.qovery.com?redirectLoginV3')
      } else if (isAuthenticated) {
        setUserWithOnboarding(true)
      }
    }
    fetchData()
  }, [getOrganization, isAuthenticated, organization.length, createAuthCookies])

  if (userWithOnboarding && isAuthenticated && organization.length === 0) {
    return <Navigate to={`${ONBOARDING_URL}${ONBOARDING_PERSONALIZE_URL}`} replace />
  }

  return (
    <LayoutLogin>
      <Login
        authLogin={authLogin}
        githubType={AuthEnum.GITHUB}
        gitlabType={AuthEnum.GITLAB}
        bitbucketType={AuthEnum.BITBUCKET}
      />
    </LayoutLogin>
  )
}

export default LoginPage
