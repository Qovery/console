import { useAuth0 } from '@auth0/auth0-react'
import { type PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LOGIN_URL } from '@qovery/shared/routes'

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const { isAuthenticated } = useAuth0()
  const location = useLocation()

  if (!isAuthenticated) {
    localStorage.setItem('redirectLoginUri', location.pathname)
    return <Navigate to={LOGIN_URL} replace />
  }

  return children
}

export default ProtectedRoute
