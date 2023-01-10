import posthog from 'posthog-js'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@qovery/shared/auth'
import { LOGIN_URL } from '@qovery/shared/routes'
import { LoadingScreen } from '@qovery/shared/ui'

export function PageLogoutFeature() {
  const { authLogout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    authLogout().then(() => {
      posthog.reset()
      navigate(LOGIN_URL)
    })
  }, [authLogout, navigate])

  return <LoadingScreen />
}

export default PageLogoutFeature
