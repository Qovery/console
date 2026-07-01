import { useAuth0 } from '@auth0/auth0-react'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

export function useAuth() {
  const { loginWithRedirect, logout, user, getAccessTokenSilently, isLoading } = useAuth0()
  const queryClient = useQueryClient()

  /**
   * Authentification login
   * Gitlab uppercase is needed
   */
  const authLogin = async (provider?: string, returnTo?: string) => {
    await loginWithRedirect({
      authorizationParams: {
        connection: provider,
      },
      appState: returnTo ? { returnTo } : undefined,
    })
  }

  /**
   * Authentification logout
   */
  const authLogout = useCallback(async () => {
    queryClient.clear()
    return await logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    })
  }, [logout, queryClient])

  return {
    user,
    authLogin,
    authLogout,
    isLoading,
    getAccessTokenSilently,
  }
}

export default useAuth
