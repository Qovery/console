import { useAuth0 } from '@auth0/auth0-react'
import { type AxiosInstance, type AxiosResponse } from 'axios'
import { useEffect } from 'react'
import { NODE_ENV } from '@qovery/shared/util-node-env'

export interface SerializedError {
  name?: string
  message?: string
  stack?: string
  code?: string
  response?: AxiosResponse
}

const E2E_AUTH_TOKEN_STORAGE_KEY = 'qovery-e2e-auth-token'
// Auth0 errors meaning the cached session can't be renewed without signing in again
const AUTH0_SESSION_ERRORS = ['login_required', 'missing_refresh_token', 'invalid_grant', 'consent_required']

export function isAuth0SessionError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    AUTH0_SESSION_ERRORS.includes((error as { error: unknown }).error as string)
  )
}

export function buildLoginRedirectUrl(pathname: string, search: string, hash: string) {
  const redirect = `${pathname}${search}${hash}`
  const searchParams = new URLSearchParams({ redirect })

  return `/login?${searchParams.toString()}`
}

function redirectToLogin() {
  if (window.location.pathname.startsWith('/login')) return

  window.location.assign(buildLoginRedirectUrl(window.location.pathname, window.location.search, window.location.hash))
}

export function useAuthInterceptor(
  axiosInstance: AxiosInstance,
  apiUrl: string,
  navigateToLogin: () => void = redirectToLogin
) {
  const { getAccessTokenSilently, logout } = useAuth0()

  useEffect(() => {
    // Clear the cached Auth0 user before leaving, otherwise the login page still sees
    // `isAuthenticated` and sends us straight back, looping forever
    const clearSessionAndNavigateToLogin = async () => {
      try {
        await logout({ openUrl: false })
      } catch (error) {
        console.error(error)
      }
      navigateToLogin()
    }

    const requestInterceptor = axiosInstance.interceptors.request.use(async (config) => {
      // The auto generated api adds a base url by default
      // we override here to have a better control over it
      const urlWithoutBase = removeBaseUrl(config.url)
      config.url = `${apiUrl}${urlWithoutBase}`

      let token = window.localStorage.getItem(E2E_AUTH_TOKEN_STORAGE_KEY)
      try {
        token = token || (await getAccessTokenSilently())
      } catch (e) {
        if (isAuth0SessionError(e)) {
          await clearSessionAndNavigateToLogin()
        } else {
          navigateToLogin()
        }
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
      async (error) => {
        if (NODE_ENV !== 'production') {
          console.error(
            error.response?.data?.error || error.code || 'Error',
            error.response?.data?.detail || error.detail
          )
        }

        if (error.response?.status === 401) {
          await clearSessionAndNavigateToLogin()
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
    logout,
    navigateToLogin,
  ])

  const removeBaseUrl = (url = '') => {
    if (!url) return ''
    // eslint-disable-next-line no-useless-escape
    const matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)
    const domain = (matches && matches[0]) as string
    return url.replace(domain, '/')
  }
}
