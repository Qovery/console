import { useAuth0 } from '@auth0/auth0-react'
import { type AxiosInstance } from 'axios'
import { useEffect } from 'react'
import { NODE_ENV } from '@qovery/shared/util-node-env'

export interface SerializedError {
  name?: string
  message?: string
  stack?: string
  code?: string
}

export function useAuthInterceptor(axiosInstance: AxiosInstance, apiUrl: string) {
  const { getAccessTokenSilently } = useAuth0()

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(async (config) => {
      // The auto generated api adds a base url by default
      // we override here to have a better control over it
      const urlWithoutBase = removeBaseUrl(config.url)
      config.url = `${apiUrl}${urlWithoutBase}`

      let token
      try {
        token = await getAccessTokenSilently()
      } catch (e) {
        return config
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

        // we reformat the error output to improve the dev experience
        // without this we should add a catch in every asyncThunk api call
        // see: https://stackoverflow.com/questions/63439021/handling-errors-with-redux-toolkit
        const err: SerializedError = {
          message: error.response?.data?.detail,
          name: error.response?.data?.error,
          code: error.response?.data?.status?.toString(),
        }
        return Promise.reject(err)
      }
    )

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor)
      axiosInstance.interceptors.response.eject(responseInterceptor)
    }
  }, [axiosInstance.interceptors.request, axiosInstance.interceptors.response, apiUrl, getAccessTokenSilently])

  const removeBaseUrl = (url = '') => {
    if (!url) return ''
    // eslint-disable-next-line no-useless-escape
    const matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)
    const domain = (matches && matches[0]) as string
    return url.replace(domain, '/')
  }
}
