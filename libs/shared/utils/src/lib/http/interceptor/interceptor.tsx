import { AxiosRequestConfig, AxiosInstance } from 'axios'
import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export function SetupInterceptor(axiosInstance: AxiosInstance, apiUrl: string) {
  const { getAccessTokenSilently } = useAuth0()

  useEffect(() => {
    const authInterceptor = axiosInstance.interceptors.request.use(async (config: AxiosRequestConfig) => {
      const url = `${apiUrl}${config.url}`
      config.url = url

      const token = await getAccessTokenSilently()
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`,
        }
      }

      return config
    })
    return () => {
      axiosInstance.interceptors.request.eject(authInterceptor)
    }
  }, [axiosInstance.interceptors.request, apiUrl, getAccessTokenSilently])
}
