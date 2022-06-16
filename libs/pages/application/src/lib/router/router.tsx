import {
  APPLICATION_DEPLOYMENTS_URL,
  APPLICATION_GENERAL_URL,
  APPLICATION_METRICS_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_VARIABLES_URL,
  Route,
} from '@console/shared/router'
import PageGeneralFeature from '../feature/page-general-feature/page-general-feature'
import PageDeploymentsFeature from '../feature/page-deployments-feature/page-deployments-feature'
import PageMetricsFeature from '../feature/page-metrics-feature/page-metrics-feature'
import PageVariablesFeature from '../feature/page-variables-feature/page-variables-feature'
import PageSettingsFeature from '../feature/page-settings-feature/page-settings-feature'

export const ROUTER_APPLICATION: Route[] = [
  {
    path: APPLICATION_GENERAL_URL,
    component: <PageGeneralFeature />,
  },
  {
    path: APPLICATION_DEPLOYMENTS_URL,
    component: <PageDeploymentsFeature />,
  },
  {
    path: APPLICATION_METRICS_URL,
    component: <PageMetricsFeature />,
  },
  {
    path: APPLICATION_VARIABLES_URL,
    component: <PageVariablesFeature />,
  },
  {
    path: APPLICATION_SETTINGS_URL,
    component: <PageSettingsFeature />,
  },
]
