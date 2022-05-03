import { ENVIRONMENTS_DEPLOYMENT_RULES_URL, Route } from '@console/shared/utils'
import DeploymentRules from '../components/deployment-rules/deployment-rules'

export const ROUTER_ENVIRONMENTS: Route[] = [
  {
    path: `/general`,
    component: <DeploymentRules />,
  },
  {
    path: ENVIRONMENTS_DEPLOYMENT_RULES_URL,
    component: <DeploymentRules />,
  },
]
