import {
  ENVIRONMENTS_DEPLOYMENT_RULES_URL,
  ENVIRONMENTS_DEPLOYMENT_RULES_CREATE_URL,
  ENVIRONMENTS_DEPLOYMENT_RULES_EDIT_URL,
  ENVIRONMENTS_GENERAL_URL,
  ENVIRONMENTS_SETTINGS_URL,
  ENVIRONMENTS_SETTINGS_GENERAL_URL,
  Route,
} from '@console/shared/router'
import PageCreateDeploymentRuleFeature from '../feature/page-create-deployment-rule-feature/page-create-deployment-rule-feature'
import PageDeploymentRulesFeature from '../feature/page-deployment-rules-feature/page-deployment-rules-feature'
import PageEditDeploymentRuleFeature from '../feature/page-edit-deployment-rule-feature/page-edit-deployment-rule-feature'
import PageGeneralFeature from '../feature/page-general-feature/page-general-feature'
import PageSettingsFeature from '../feature/page-settings-feature/page-settings-feature'
import PageSettingsGeneralFeature from '../feature/page-settings-general-feature/page-settings-general-feature'

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
    path: ENVIRONMENTS_DEPLOYMENT_RULES_CREATE_URL,
    component: <PageCreateDeploymentRuleFeature />,
  },
  {
    path: ENVIRONMENTS_DEPLOYMENT_RULES_EDIT_URL(),
    component: <PageEditDeploymentRuleFeature />,
  },
  {
    path: `${ENVIRONMENTS_SETTINGS_URL}/*`,
    component: <PageSettingsFeature />,
  },
]

export const ROUTER_ENVIRONMENTS_SETTINGS: Route[] = [
  {
    path: ENVIRONMENTS_SETTINGS_GENERAL_URL,
    component: <PageSettingsGeneralFeature />,
  },
]
