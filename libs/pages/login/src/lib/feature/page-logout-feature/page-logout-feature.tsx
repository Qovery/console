import { useAuth } from '@console/shared/auth'
import { useNavigate } from 'react-router'
import { LoadingScreen } from '@console/shared/ui'
import posthog from 'posthog-js'
import { LOGIN_URL } from '@console/shared/router'
import { useEffect } from 'react'

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
