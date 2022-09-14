import { LoadingScreen } from '@qovery/shared/ui'
import useRedirectIfLogged from '../../hooks/use-redirect-if-logged/use-redirect-if-logged'

export function PageRedirectLogin() {
  useRedirectIfLogged()

  return <LoadingScreen />
}

export default PageRedirectLogin
