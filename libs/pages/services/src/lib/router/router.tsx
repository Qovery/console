import { Route, SERVICES_DEPLOYMENTS_URL, SERVICES_GENERAL_URL } from '@console/shared/router'
import PageGeneralFeature from '../feature/page-general-feature/page-general-feature'
import PageDeploymentsFeature from '../feature/page-deployments-feature/page-deployments-feature'

export const ROUTER_SERVICES: Route[] = [
  {
    path: SERVICES_GENERAL_URL,
    component: <PageGeneralFeature />,
  },
  {
    path: SERVICES_DEPLOYMENTS_URL,
    component: <PageDeploymentsFeature />,
  },
]
