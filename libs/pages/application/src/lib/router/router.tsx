import {
  APPLICATION_DEPLOYMENTS_URL,
  APPLICATION_GENERAL_URL,
  APPLICATION_METRICS_URL,
  APPLICATION_SETTINGS_ADVANCED_SETTINGS_URL,
  APPLICATION_SETTINGS_DANGER_ZONE_URL,
  APPLICATION_SETTINGS_DOMAIN_URL,
  APPLICATION_SETTINGS_GENERAL_URL,
  APPLICATION_SETTINGS_PORT_URL,
  APPLICATION_SETTINGS_RESSOURCES_URL,
  APPLICATION_SETTINGS_STORAGE_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_VARIABLES_URL,
  Route,
} from '@console/shared/router'
import PageGeneralFeature from '../feature/page-general-feature/page-general-feature'
import PageDeploymentsFeature from '../feature/page-deployments-feature/page-deployments-feature'
import PageMetricsFeature from '../feature/page-metrics-feature/page-metrics-feature'
import PageVariablesFeature from '../feature/page-variables-feature/page-variables-feature'
import PageSettingsFeature from '../feature/page-settings-feature/page-settings-feature'
import PageSettingsV2 from '../ui/page-settings-v2/page-settings-v2'

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
    path: `${APPLICATION_SETTINGS_URL}/*`,
    component: <PageSettingsFeature />,
  },
]

export const ROUTER_APPLICATION_SETTINGS: Route[] = [
  {
    path: APPLICATION_SETTINGS_GENERAL_URL,
    component: <PageSettingsV2 />,
  },
  {
    path: APPLICATION_SETTINGS_RESSOURCES_URL,
    component: <PageSettingsV2 />,
  },
  {
    path: APPLICATION_SETTINGS_STORAGE_URL,
    component: <PageSettingsV2 />,
  },
  {
    path: APPLICATION_SETTINGS_PORT_URL,
    component: <PageSettingsV2 />,
  },
  {
    path: APPLICATION_SETTINGS_DOMAIN_URL,
    component: <PageSettingsV2 />,
  },
  {
    path: APPLICATION_SETTINGS_ADVANCED_SETTINGS_URL,
    component: <PageSettingsV2 />,
  },
  {
    path: APPLICATION_SETTINGS_DANGER_ZONE_URL,
    component: <PageSettingsV2 />,
  },
]
