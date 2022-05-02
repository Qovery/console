import { ENVIRONMENTS_DEPLOYMENT_RULES_URL, ENVIRONMENTS_URL, Route } from '@console/shared/utils'
import DeploymentRules from '../components/deployment-rules/deployment-rules'
import EnvironmentsPage from '../environments-page'

export const ROUTER_ENVIRONMENTS: Route[] = [
  /*{
    path: (organizationId?: string, projectId?: string) => ENVIRONMENTS_URL(organizationId, projectId),
    component: <DeploymentRules />,
  },
  {
    path: (organizationId?: string, projectId?: string) => ENVIRONMENTS_DEPLOYMENT_RULES_URL(organizationId, projectId),
    component: <DeploymentRules />,
  },*/
]
