import { useAuth0 } from '@auth0/auth0-react'
import { useCallback } from 'react'

export function useAuth() {
  const { loginWithRedirect, logout, user, getAccessTokenSilently, isLoading } = useAuth0()

  /**
   * Authentification login
   * Gitlab uppercase is needed
   */
  const authLogin = async (provider?: string) => {
    await loginWithRedirect({
      authorizationParams: {
        connection: provider,
      },
    })
  }

  /**
   * Authentification logout
   */
  const authLogout = useCallback(async () => {
    return await logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    })
  }, [logout])

  return {
    user,
    authLogin,
    authLogout,
    isLoading,
    getAccessTokenSilently,
  }
}

export default useAuth
