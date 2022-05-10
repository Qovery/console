import { ENVIRONMENTS_DEPLOYMENT_RULES_URL, ENVIRONMENTS_GENERAL_URL, Route } from '@console/shared/utils'
import DeploymentRules from '../components/deployment-rules/deployment-rules'
import General from '../components/general/general'

export const ROUTER_ENVIRONMENTS: Route[] = [
  {
    path: ENVIRONMENTS_GENERAL_URL,
    component: <General />,
  },
  {
    path: ENVIRONMENTS_DEPLOYMENT_RULES_URL,
    component: <DeploymentRules />,
  },
]
