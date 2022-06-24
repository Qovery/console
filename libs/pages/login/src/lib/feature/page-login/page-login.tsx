import { useDocumentTitle } from '@console/shared/utils'
import { AuthEnum, useAuth } from '@console/shared/auth'
import LayoutLogin from '../../ui/layout-login/layout-login'
import Login from '../../ui/login/login'
import useRedirectIfLogged from '../../hooks/use-redirect-if-logged/use-redirect-if-logged'

export function PageLoginFeature() {
  const { authLogin } = useAuth()

  useDocumentTitle('Login - Qovery')

  useRedirectIfLogged()
  const onClickAuthLogin = async (provider: string) => {
    await authLogin(provider)
  }

  return (
    <LayoutLogin>
      <Login
        onClickAuthLogin={onClickAuthLogin}
        githubType={AuthEnum.GITHUB}
        gitlabType={AuthEnum.GITLAB}
        bitbucketType={AuthEnum.BITBUCKET}
      />
    </LayoutLogin>
  )
}

export default PageLoginFeature
