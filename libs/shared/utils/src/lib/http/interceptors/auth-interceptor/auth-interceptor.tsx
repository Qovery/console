import { useAuth0 } from '@auth0/auth0-react'
import { SerializedError } from '@reduxjs/toolkit'
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useEffect } from 'react'

export function useAuthInterceptor(axiosInstance: AxiosInstance, apiUrl: string) {
  const { getAccessTokenSilently } = useAuth0()

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(async (config: AxiosRequestConfig) => {
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
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        }
      }

      return config
    })
    const responseInterceptor = axiosInstance.interceptors.response.use(
      async (response: AxiosResponse) => {
        return response
      },
      (error) => {
        if (process.env['NODE_ENV'] !== 'production') {
          console.error(
            error.response?.data?.error || error.code || 'Error',
            error.response?.data?.message || error.message
          )
        }

        // we reformat the error output to improve the dev experience
        // without this we should add a catch in every asyncThunk api call
        // see: https://stackoverflow.com/questions/63439021/handling-errors-with-redux-toolkit
        const err: SerializedError = {
          message: error.response?.data?.message,
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
    const matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)
    const domain = (matches && matches[0]) as string
    return url.replace(domain, '/')
  }
}
