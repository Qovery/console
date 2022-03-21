import { Navigate } from 'react-router'
import { LayoutLogin, Login } from '@console/pages/login/ui'
import {
  ONBOARDING_PERSONALIZE_URL,
  ONBOARDING_URL,
  OVERVIEW_URL,
  useAuth,
  useDocumentTitle,
  AuthEnum,
} from '@console/shared/utils'
import { useOrganization } from '@console/domains/organization'

export function LoginPage() {
  const { authLogin, isAuthenticated } = useAuth()
  const { organization } = useOrganization()

  useDocumentTitle('Login - Qovery')

  if (isAuthenticated && organization.length > 0) {
    return <Navigate to={OVERVIEW_URL} replace />
  }

  if (isAuthenticated && organization.length === 0) {
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
