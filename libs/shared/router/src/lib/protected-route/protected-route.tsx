import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@qovery/shared/auth'
import { LOGIN_URL } from '@qovery/shared/routes'

export interface IProtectedRoute {
  children: React.ReactElement
}

export const ProtectedRoute = ({ children }: IProtectedRoute) => {
  const { checkIsAuthenticated, getCurrentUser } = useAuth()
  const location = useLocation()

  useEffect(() => {
    getCurrentUser()
  }, [getCurrentUser])

  if (!checkIsAuthenticated) {
    localStorage.setItem('redirectLoginUri', location.pathname)
    return <Navigate to={LOGIN_URL} replace />
  }

  return children
}

export default ProtectedRoute
