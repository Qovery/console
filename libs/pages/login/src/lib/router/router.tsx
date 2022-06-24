import { LOGIN_AUTH_REDIRECT_URL, Route } from '@console/shared/router'
import PageRedirectLogin from '../feature/page-redirect-login/page-redirect-login'
import PageLoginFeature from '../feature/page-login/page-login'

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
