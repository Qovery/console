import { Navigate } from 'react-router'
import { LayoutLogin, Login } from '@console/pages/login/ui'
import {
  ONBOARDING_PERSONALIZE_URL,
  ONBOARDING_URL,
  OVERVIEW_URL,
  useAuth,
  useDocumentTitle,
} from '@console/shared/utils'
import { useOrganizations } from '@console/domains/organizations'

export function LoginPage() {
  const { authLogin, isAuthenticated } = useAuth()
  const { organizations, loadingStatus } = useOrganizations()

  useDocumentTitle('Login - Qovery')

  if (isAuthenticated && loadingStatus !== 'loaded') {
    return <></>
  }

  if (isAuthenticated && organizations.length > 0) {
    return <Navigate to={OVERVIEW_URL} replace />
  }

  if (isAuthenticated && organizations.length === 0) {
    return <Navigate to={`${ONBOARDING_URL}${ONBOARDING_PERSONALIZE_URL}`} replace />
  }

  return (
    <LayoutLogin>
      <Login authLogin={authLogin} />
    </LayoutLogin>
  )
}

export default LoginPage
