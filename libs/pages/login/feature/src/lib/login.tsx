import { useNavigate } from 'react-router'
import { LayoutLogin, Login } from '@console/pages/login/ui'
import { ONBOARDING_PERSONALIZE_URL, ONBOARDING_URL, useAuth, useDocumentTitle, AuthEnum } from '@console/shared/utils'
import { useOrganization } from '@console/domains/organization'

export function LoginPage() {
  const navigate = useNavigate()
  const { authLogin, createAuthCookies } = useAuth()
  const { getOrganization } = useOrganization()

  useDocumentTitle('Login - Qovery')

  const onClickAuthLogin = async (provider: string) => {
    await authLogin(provider)
    const organization = await getOrganization()
    if (organization.payload.length > 0) {
      await createAuthCookies()
      setTimeout(
        () => window.location.replace(`${process.env['NX_URL'] || 'https://console.qovery.com'}?redirectLoginV3`),
        500
      )
    } else {
      navigate(`${ONBOARDING_URL}${ONBOARDING_PERSONALIZE_URL}`)
    }
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

export default LoginPage
