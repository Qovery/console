import { useState } from 'react'
import { useAuth } from '@qovery/shared/auth'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import useRedirectIfLogged from '../../hooks/use-redirect-if-logged/use-redirect-if-logged'
import Login from '../../ui/login/login'

export function PageLoginFeature() {
  const { authLogin } = useAuth()

  useDocumentTitle('Login - Qovery')
  const [loading, setLoading] = useState<{ provider: string; active: boolean } | undefined>()

  useRedirectIfLogged()

  const onClickAuthLogin = async (provider: string) => {
    setLoading({
      provider: provider,
      active: true,
    })
    try {
      // XXX: Cleanup legacy jwtToken cookie which can cause RequestHeaderSectionTooLarge problems
      // https://qovery.atlassian.net/browse/FRT-1086
      // https://github.com/Qovery/console/pull/1188
      if (document.cookie.split(';').some((item) => item.trim().startsWith('jwtToken='))) {
        document.cookie = 'jwtToken=; Max-Age=-99999999; domain=.qovery.com'
      }
      await authLogin(provider)
    } catch (error) {
      console.error(error)
    }
  }

  return <Login onClickAuthLogin={onClickAuthLogin} loading={loading} />
}

export default PageLoginFeature
