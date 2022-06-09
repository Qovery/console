import { SERVICES_GENERAL_URL, Route, SERVICES_DEPLOYMENTS_URL } from '@console/shared/utils'
import Deployments from '../components/deployments/deployments'
import General from '../components/general/general'

export const ROUTER_SERVICES: Route[] = [
  {
    path: SERVICES_GENERAL_URL,
    component: <General />,
  },
  {
    path: SERVICES_DEPLOYMENTS_URL,
    component: <Deployments />,
  },
]
