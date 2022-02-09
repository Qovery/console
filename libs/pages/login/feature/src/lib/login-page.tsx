import { Navigate } from 'react-router'
import { Login } from '@console/pages/login/ui'
import { OVERVIEW_URL, useAuth } from '@console/shared/utils'

export function LoginPage() {
  const { authLogin, authLogout, isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={OVERVIEW_URL} replace />
  }

  return <Login authLogin={authLogin} authLogout={authLogout} />
}

export default LoginPage
