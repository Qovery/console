import { useAuth0 } from '@auth0/auth0-react'
import { useCallback } from 'react'

export function useAuth() {
  const { loginWithRedirect, logout, user, getAccessTokenSilently, isLoading } = useAuth0()

  /**
   * Authentification login
   * Gitlab uppercase is needed
   */
  const authLogin = async (provider: string) => {
    await loginWithRedirect({
      connection: provider,
      login: 'login',
    })
  }

  /**
   * Authentification logout
   */
  const authLogout = useCallback(async () => {
    return await logout({
      returnTo: window.location.origin,
    })
  }, [logout])

  /**
   * Create authentification cookies
   */
  const createAuthCookies = useCallback(async () => {
    const currentToken = localStorage.getItem(
      '@@auth0spajs@@::S4fQF5rkTng8CqHsc1kw41fG09u4R7A0::https://core.qovery.com::openid profile email offline_access'
    )
    const hostname = window.location.hostname
    const domainName = hostname.match(/^(?:.*?\.)?([a-zA-Z0-9\-_]{3,}\.(?:\w{2,8}|\w{2,4}\.\w{2,4}))$/)

    function eraseCookie(name: string) {
      document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    }

    function setCookie(name: string, value: string, days: number) {
      let expires = ''
      if (days) {
        const date = new Date()
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
        expires = '; expires=' + date.toUTCString()
      }
      document.cookie =
        name + '=' + (value || '') + expires + `;domain=${domainName ? domainName[1] : 'localhost'};path=/`
    }

    eraseCookie('jwtToken')
    eraseCookie('idToken')
    eraseCookie('authExpiresAt')

    const data = currentToken && JSON.parse(currentToken)

    if (data && data.body) {
      setCookie('jwtToken', data.body.access_token, 100000)
      setCookie('idToken', data.body.id_token, 100000)
      setCookie('authExpiresAt', data.expiresAt, 100000)
    }
  }, [])

  return {
    user,
    authLogin,
    authLogout,
    isLoading,
    getAccessTokenSilently,
    createAuthCookies,
  }
}

export default useAuth
