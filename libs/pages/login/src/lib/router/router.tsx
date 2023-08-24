import { LOGIN_AUTH_REDIRECT_URL, type Route } from '@qovery/shared/routes'
import PageLoginFeature from '../feature/page-login/page-login'
import PageRedirectLogin from '../feature/page-redirect-login/page-redirect-login'

export const ROUTER_LOGIN: Route[] = [
  {
    path: '',
    component: <PageLoginFeature />,
  },
  {
    path: LOGIN_AUTH_REDIRECT_URL,
    component: <PageRedirectLogin />,
  },
]
