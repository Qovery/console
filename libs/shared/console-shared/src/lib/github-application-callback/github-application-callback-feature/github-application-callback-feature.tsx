import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { connectGithubApp } from '@qovery/domains/organization'
import { SETTINGS_GIT_REPOSITORY_ACCESS_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { ToastEnum, toast } from '@qovery/shared/ui'
import { type AppDispatch } from '@qovery/state/store'

export function GithubApplicationCallbackFeature() {
  const { search } = useLocation()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(search)
    const code = params.get('code')
    const organizationId = params.get('state')
    const installationId = params.get('installation_id')

    if (code && organizationId && installationId)
      dispatch(connectGithubApp({ organizationId, appConnectRequest: { code: code, installation_id: installationId } }))
        .unwrap()
        .then(() => {
          toast(ToastEnum.SUCCESS, `Github application connection success`)
          navigate(SETTINGS_URL(organizationId) + SETTINGS_GIT_REPOSITORY_ACCESS_URL)
        })
        .catch((err) => {
          toast(ToastEnum.ERROR, `Github application connection error`, err.message)
          navigate(SETTINGS_URL(organizationId) + SETTINGS_GIT_REPOSITORY_ACCESS_URL)
        })
    else {
      toast(ToastEnum.ERROR, `Github application connection error`, 'Invalid parameters')
      navigate('/')
    }
  }, [search, dispatch, navigate])

  return null
}

export default GithubApplicationCallbackFeature
