import { Navigate, useSearchParams } from 'react-router-dom'
import { LOGIN_URL } from '@qovery/shared/routes'
import { LoadingScreen } from '@qovery/shared/ui'
import useRedirectIfLogged from '../../hooks/use-redirect-if-logged/use-redirect-if-logged'

export function PageRedirectLogin() {
  const [searchParams] = useSearchParams()

  useRedirectIfLogged()

  const error = searchParams.get('error')
  if (error != null) {
    const errorDescription = searchParams.get('error_description') || 'No description available'

    // Handle specific OIDC / SAML issue: the domain provided by the user doesn't exist on Auth0 side
    if (error === 'invalid_request' && errorDescription.includes('')) {
      sessionStorage.setItem('auth0_error', 'Invalid Enterprise SSO Domain Name')
      sessionStorage.setItem('auth0_error_description', 'The domain name provided is not authorized')
    }

    return <Navigate to={LOGIN_URL} />
  }

  return <LoadingScreen />
}

export default PageRedirectLogin
