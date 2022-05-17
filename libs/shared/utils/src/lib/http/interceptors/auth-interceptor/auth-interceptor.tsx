import { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

// import { toast, ToastEnum } from '@console/shared/ui'

export function useAuthInterceptor(axiosInstance: AxiosInstance, apiUrl: string) {
  const { getAccessTokenSilently } = useAuth0()

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(async (config: AxiosRequestConfig) => {
      // The auto generated api adds a base url by default
      // we override here to have a better control over it
      const urlWithoutBase = removeBaseUrl(config.url)
      config.url = `${apiUrl}${urlWithoutBase}`

      const token = await getAccessTokenSilently()

      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        }
      }

      return config
    })
    const responseInterceptor = axiosInstance.interceptors.response.use(
      async (response: AxiosResponse) => response,
      (error: AxiosError) => {
        // todo uncomment this and fix the cycling dependency by moving router folder in a dedicated library
        // toast(ToastEnum.ERROR, error.response?.data.error, error.response?.data.message)
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
