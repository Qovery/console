import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { useConnectGithubApp } from '@qovery/domains/organizations/feature'
import { SETTINGS_GIT_REPOSITORY_ACCESS_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { ToastEnum, toast } from '@qovery/shared/ui'
import { type AppDispatch } from '@qovery/state/store'

export function GithubApplicationCallbackFeature() {
  const { search } = useLocation()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { mutateAsync: mutateAsyncConnectGithubApp, isLoading: isLoadingConnectGithubApp } = useConnectGithubApp()

  useEffect(() => {
    async function connectGithubApp() {
      const params = new URLSearchParams(search)
      const code = params.get('code')
      const organizationId = params.get('state')
      const installationId = params.get('installation_id')

      if (code && organizationId && installationId) {
        try {
          await mutateAsyncConnectGithubApp({
            organizationId,
            appConnectRequest: { code: code, installation_id: installationId },
          })
          navigate(SETTINGS_URL(organizationId) + SETTINGS_GIT_REPOSITORY_ACCESS_URL)
        } catch (error) {
          console.error(error)
          navigate(SETTINGS_URL(organizationId) + SETTINGS_GIT_REPOSITORY_ACCESS_URL)
        }
      } else {
        toast(ToastEnum.ERROR, `Github application connection error`, 'Invalid parameters')
        navigate('/')
      }
    }
    connectGithubApp()
  }, [mutateAsyncConnectGithubApp, search, dispatch, navigate])

  return null
}

export default GithubApplicationCallbackFeature
