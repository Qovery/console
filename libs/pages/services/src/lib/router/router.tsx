import { Route, SERVICES_DEPLOYMENTS_URL, SERVICES_GENERAL_URL } from '@console/shared/router'
import GeneralFeature from '../feature/general/general-feature'
import DeploymentsFeature from '../feature/deployments/deployments-feature'

export const ROUTER_SERVICES: Route[] = [
  {
    path: SERVICES_GENERAL_URL,
    component: <GeneralFeature />,
  },
  {
    path: SERVICES_DEPLOYMENTS_URL,
    component: <DeploymentsFeature />,
  },
]
