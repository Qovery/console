import { useCallback } from 'react'
import { useAuth } from '@qovery/shared/auth'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import useRedirectIfLogged from '../../hooks/use-redirect-if-logged/use-redirect-if-logged'
import LayoutLogin from '../../ui/layout-login/layout-login'
import Login from '../../ui/login/login'

export function PageLoginFeature() {
  const { authLogin } = useAuth()

  useDocumentTitle('Login - Qovery')

  useRedirectIfLogged()
  const onClickAuthLogin = useCallback(
    async (provider?: string) => {
      await authLogin(provider)
    },
    [authLogin]
  )

  return (
    <LayoutLogin>
      <Login onClickAuthLogin={onClickAuthLogin} />
    </LayoutLogin>
  )
}

export default PageLoginFeature
