import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../http/use-auth/use-auth'
import { LOGIN_URL } from './router'

interface IProtectedRoute {
  children: React.ReactElement
}

export const ProtectedRoute = ({ children }: IProtectedRoute) => {
  const { isAuthenticated, getCurrentUser } = useAuth()

  useEffect(() => {
    getCurrentUser()
  }, [getCurrentUser])

  if (!isAuthenticated) {
    return <Navigate to={LOGIN_URL} replace />
  }

  return children
}

export default ProtectedRoute
