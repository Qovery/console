import toast from 'react-hot-toast'
import { AxiosRequestConfig, AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export function SetupInterceptor(axiosInstance: AxiosInstance, apiUrl: string) {
  const { getAccessTokenSilently } = useAuth0()

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(async (config: AxiosRequestConfig) => {
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
    const responseInterceptor = axiosInstance.interceptors.response.use(
      async (response: AxiosResponse) => response,
      (error: AxiosError) => {
        console.log(error)
        toast.error(error.response?.data.message)
      }
    )

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor)
      axiosInstance.interceptors.response.eject(responseInterceptor)
    }
  }, [axiosInstance.interceptors.request, axiosInstance.interceptors.response, apiUrl, getAccessTokenSilently])
}
