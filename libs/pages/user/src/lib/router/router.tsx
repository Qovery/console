import { type Route, USER_GENERAL_URL } from '@qovery/shared/routes'
import PageUserGeneralFeature from '../feature/page-user-general-feature/page-user-general-feature'

export const ROUTER_USER: Route[] = [
  {
    path: USER_GENERAL_URL,
    component: <PageUserGeneralFeature />,
  },
]
