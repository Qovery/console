import {
  ENVIRONMENTS_DEPLOYMENT_RULES_URL,
  ENVIRONMENTS_DEPLOYMENT_RULES_URL_CREATE,
  ENVIRONMENTS_DEPLOYMENT_RULES_URL_EDIT,
  ENVIRONMENTS_GENERAL_URL,
  Route,
} from '@console/shared/router'
import PageCreateDeploymentRuleFeature from '../feature/page-create-deployment-rule-feature/page-create-deployment-rule-feature'
import PageDeploymentRulesFeature from '../feature/page-deployment-rules-feature/page-deployment-rules-feature'
import PageEditDeploymentRuleFeature from '../feature/page-edit-deployment-rule-feature/page-edit-deployment-rule-feature'
import PageGeneralFeature from '../feature/page-general-feature/page-general-feature'

export const ROUTER_ENVIRONMENTS: Route[] = [
  {
    path: ENVIRONMENTS_GENERAL_URL,
    component: <PageGeneralFeature />,
  },
  {
    path: ENVIRONMENTS_DEPLOYMENT_RULES_URL,
    component: <PageDeploymentRulesFeature />,
  },
  {
    path: ENVIRONMENTS_DEPLOYMENT_RULES_URL_CREATE,
    component: <PageCreateDeploymentRuleFeature />,
  },
  {
    path: ENVIRONMENTS_DEPLOYMENT_RULES_URL_EDIT,
    component: <PageEditDeploymentRuleFeature />,
  },
]
