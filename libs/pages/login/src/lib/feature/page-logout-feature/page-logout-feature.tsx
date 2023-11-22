import posthog from 'posthog-js'
import { useEffect } from 'react'
import { useAuth } from '@qovery/shared/auth'
import { LoadingScreen } from '@qovery/shared/ui'

export function PageLogoutFeature() {
  const { authLogout } = useAuth()

  useEffect(() => {
    async function redirectLogout() {
      await authLogout()
      posthog.reset()
    }
    redirectLogout()
  }, [authLogout])

  return <LoadingScreen />
}

export default PageLogoutFeature
