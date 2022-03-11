import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useAuth0 } from '@auth0/auth0-react'
import { userActions, UserInterface } from '@console/domains/user'

export function useAuth() {
  const { loginWithPopup, logout, user, getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0()
  const dispatch = useDispatch()

  /**
   * Authentification login
   * Gitlab uppercase is needed
   */
  const authLogin = useCallback(
    (provider: string) => {
      return loginWithPopup({
        connection: provider,
        login: 'login',
      })
    },
    [loginWithPopup]
  )

  /**
   * Authentification logout
   */
  const authLogout = useCallback(async () => {
    dispatch(userActions.remove())
    return await logout({
      returnTo: window.location.origin,
    })
  }, [logout, dispatch])

  /**
   * Get current user with auth0
   */
  const getCurrentUser = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently()

      if (user) {
        const userInfos: UserInterface = {
          name: user.name,
          email: user.email,
          sub: user.sub,
          picture: user.picture,
          isAuthenticated,
          isLoading,
          token,
        }
        dispatch(userActions.add(userInfos))
      }
    } catch (e) {
      console.log(e)
    }
  }, [user, getAccessTokenSilently, dispatch, isLoading, isAuthenticated])

  return { authLogin, authLogout, getCurrentUser, isAuthenticated, isLoading }
}

export default useAuth
