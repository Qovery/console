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
      await authLogin(provider)
    } catch (error) {
      console.error(error)
    }
  }

  return <Login onClickAuthLogin={onClickAuthLogin} loading={loading} />
}

export default PageLoginFeature
