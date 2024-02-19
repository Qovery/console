import { Navigate, useSearchParams } from 'react-router-dom'
import { LOGIN_URL } from '@qovery/shared/routes'
import { LoadingScreen } from '@qovery/shared/ui'
import useRedirectIfLogged from '../../hooks/use-redirect-if-logged/use-redirect-if-logged'

export function PageRedirectLogin() {
  const [searchParams] = useSearchParams()

  useRedirectIfLogged()

  if (searchParams.get('error')) {
    return <Navigate to={LOGIN_URL} />
  }

  return <LoadingScreen />
}

export default PageRedirectLogin
