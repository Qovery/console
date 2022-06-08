import { APPLICATIONS_DEPLOYMENTS_URL, APPLICATIONS_GENERAL_URL, Route } from '@console/shared/utils'
import Deployments from '../components/deployments/deployments'
import General from '../components/general/general'

export const ROUTER_APPLICATIONS: Route[] = [
  {
    path: APPLICATIONS_GENERAL_URL,
    component: <General />,
  },
  {
    path: APPLICATIONS_DEPLOYMENTS_URL,
    component: <Deployments />,
  },
]
