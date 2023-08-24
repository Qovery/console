import { AUDIT_LOGS_GENERAL_URL, type Route } from '@qovery/shared/routes'
import PageGeneralFeature from '../feature/page-general-feature/page-general-feature'

export const ROUTER_EVENTS: Route[] = [
  {
    path: AUDIT_LOGS_GENERAL_URL,
    component: <PageGeneralFeature />,
  },
]
