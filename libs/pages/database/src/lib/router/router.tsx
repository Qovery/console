import {
  DATABASE_DEPLOYMENTS_URL,
  DATABASE_GENERAL_URL,
  DATABASE_SETTINGS_URL,
  DATABASE_VARIABLES_URL,
  Route,
} from '@console/shared/router'
import PageGeneralFeature from '../feature/page-general-feature/page-general-feature'
import PageDeploymentsFeature from '../feature/page-deployments-feature/page-deployments-feature'
import PageVariablesFeature from '../feature/page-variables-feature/page-variables-feature'
import PageSettingsFeature from '../feature/page-settings-feature/page-settings-feature'

export const ROUTER_DATABASE: Route[] = [
  {
    path: DATABASE_GENERAL_URL,
    component: <PageGeneralFeature />,
  },
  {
    path: DATABASE_DEPLOYMENTS_URL,
    component: <PageDeploymentsFeature />,
  },
  {
    path: DATABASE_VARIABLES_URL,
    component: <PageVariablesFeature />,
  },
  {
    path: DATABASE_SETTINGS_URL,
    component: <PageSettingsFeature />,
  },
]
