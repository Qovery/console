import {
  ENVIRONMENTS_DEPLOYMENT_RULES_URL,
  ENVIRONMENTS_DEPLOYMENT_RULES_URL_CREATE,
  ENVIRONMENTS_DEPLOYMENT_RULES_URL_EDIT,
  ENVIRONMENTS_GENERAL_URL,
  Route,
} from '@console/shared/utils'
import CreateDeploymentRule from '../components/deployment-rules/create-deployment-rule/create-deployment-rule'
import { DeploymentRules } from '../components/deployment-rules/deployment-rules'
import EditDeploymentRule from '../components/deployment-rules/edit-deployment-rule/edit-deployment-rule'
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
  {
    path: ENVIRONMENTS_DEPLOYMENT_RULES_URL_CREATE,
    component: <CreateDeploymentRule />,
  },
  {
    path: ENVIRONMENTS_DEPLOYMENT_RULES_URL_EDIT,
    component: <EditDeploymentRule />,
  },
]
