import { useAuth } from '@console/shared/auth'
import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { LOGIN_URL } from '../router'

export interface IProtectedRoute {
  children: React.ReactElement
}

export const ProtectedRoute = ({ children }: IProtectedRoute) => {
  const { checkIsAuthenticated, getCurrentUser } = useAuth()

  useEffect(() => {
    getCurrentUser()
  }, [getCurrentUser])

  if (!checkIsAuthenticated) {
    return <Navigate to={LOGIN_URL} replace />
  }

  return children
}

export default ProtectedRoute
