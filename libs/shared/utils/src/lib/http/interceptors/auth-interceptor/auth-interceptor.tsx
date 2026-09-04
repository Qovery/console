import { useAuth0 } from '@auth0/auth0-react'
import { type AxiosInstance, type AxiosResponse } from 'axios'
import { useCallback, useEffect } from 'react'
import { SESSION_EXPIRED_REASON, isLoginPath } from '@qovery/shared/routes'
import { NODE_ENV } from '@qovery/shared/util-node-env'

export interface SerializedError {
  name?: string
  message?: string
  stack?: string
  code?: string
  response?: AxiosResponse
}

export interface AuthInterceptorOptions {
  navigateToLogin?: () => void
  clearSession?: () => Promise<void>
}

const E2E_AUTH_TOKEN_STORAGE_KEY = 'qovery-e2e-auth-token'

export function buildLoginRedirectUrl(pathname: string, search: string, hash: string, reason?: string) {
  const redirect = `${pathname}${search}${hash}`
  const searchParams = new URLSearchParams({ redirect })

  if (reason) {
    searchParams.set('reason', reason)
  }

  return `/login?${searchParams.toString()}`
}

function redirectToLogin() {
  window.location.assign(
    buildLoginRedirectUrl(
      window.location.pathname,
      window.location.search,
      window.location.hash,
      SESSION_EXPIRED_REASON
    )
  )
}

// A dead session produces a burst of failures — two axios instances, three React Query retries per
// query — and each one would otherwise clear the session and reload the page on its own.
let pendingAuthFailure: Promise<void> | null = null

function handleAuthFailure(clearSession: (() => Promise<void>) | undefined, navigateToLogin: () => void) {
  // Bailing out here rather than inside navigateToLogin also protects the Auth0 callback, where a
  // token request can reject while the session is still being created.
  if (isLoginPath(window.location.pathname)) return Promise.resolve()

  pendingAuthFailure ??= Promise.resolve()
    .then(() => clearSession?.())
    .catch(() => undefined)
    .then(() => {
      navigateToLogin()
    })
    .finally(() => {
      pendingAuthFailure = null
    })

  return pendingAuthFailure
}

export function useAuthInterceptor(axiosInstance: AxiosInstance, apiUrl: string, options: AuthInterceptorOptions = {}) {
  const { getAccessTokenSilently, logout } = useAuth0()
  // Destructured out of `options` so callers that pass no options don't re-register on every render
  const { navigateToLogin = redirectToLogin, clearSession } = options

  const clearAuth0Session = useCallback(async () => {
    if (clearSession) {
      await clearSession()
      return
    }
    // Wipes the cached user Auth0 keeps in localStorage, without a round-trip to the IdP
    await logout({ openUrl: false })
  }, [clearSession, logout])

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(async (config) => {
      // The auto generated api adds a base url by default
      // we override here to have a better control over it
      const urlWithoutBase = removeBaseUrl(config.url)
      config.url = `${apiUrl}${urlWithoutBase}`

      let token = window.localStorage.getItem(E2E_AUTH_TOKEN_STORAGE_KEY)
      try {
        token = token || (await getAccessTokenSilently())
      } catch (e) {
        // Auth0 refusing to mint a token is definitive, so the session goes. Awaiting matters: a
        // reload that outruns the teardown restores the dead session and the loop survives.
        await handleAuthFailure(clearAuth0Session, navigateToLogin)
        return Promise.reject(e)
      }

      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`)
      }

      return config
    })
    const responseInterceptor = axiosInstance.interceptors.response.use(
      async (response) => {
        return response
      },
      (error) => {
        if (NODE_ENV !== 'production') {
          console.error(
            error.response?.data?.error || error.code || 'Error',
            error.response?.data?.detail || error.detail
          )
        }

        if (error.response?.status === 401) {
          // No session teardown here: getAccessTokenSilently already refreshes on expiry, so a 401
          // is as likely to be one endpoint using 401 for 403 as it is a dead credential. The
          // session-expired reason on the login URL is what keeps this from looping.
          void handleAuthFailure(undefined, navigateToLogin)
        }

        // we reformat the error output to improve the dev experience
        // without this we should add a catch in every asyncThunk api call
        // see: https://stackoverflow.com/questions/63439021/handling-errors-with-redux-toolkit
        const err: SerializedError = {
          message: error.response?.data?.detail,
          name: error.response?.data?.error,
          code: error.response?.data?.status?.toString(),
          response: error.response,
        }
        return Promise.reject(err)
      }
    )

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor)
      axiosInstance.interceptors.response.eject(responseInterceptor)
    }
  }, [
    axiosInstance.interceptors.request,
    axiosInstance.interceptors.response,
    apiUrl,
    getAccessTokenSilently,
    navigateToLogin,
    clearAuth0Session,
  ])

  const removeBaseUrl = (url = '') => {
    if (!url) return ''
    // eslint-disable-next-line no-useless-escape
    const matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)
    const domain = (matches && matches[0]) as string
    return url.replace(domain, '/')
  }
}
