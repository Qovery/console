import {
  Route,
  SERVICES_DEPLOYMENTS_URL,
  SERVICES_GENERAL_URL,
  SERVICES_SETTINGS_URL,
  SERVICES_SETTINGS_GENERAL_URL,
  SERVICES_SETTINGS_DEPLOYMENT_URL,
  SERVICES_SETTINGS_PREVIEW_ENV_URL,
  SERVICES_SETTINGS_DANGER_ZONE_URL,
  SERVICES_SETTINGS_ADVANCED_SETTINGS_URL,
} from '@console/shared/router'
import PageGeneralFeature from '../feature/page-general-feature/page-general-feature'
import PageDeploymentsFeature from '../feature/page-deployments-feature/page-deployments-feature'
import PageSettingsFeature from '../feature/page-settings-feature/page-settings-feature'
import PageSettingsGeneralFeature from '../feature/page-settings-general-feature/page-settings-general-feature'
import PageSettingsV2 from '../ui/page-settings-v2/page-settings-v2'

export const ROUTER_SERVICES: Route[] = [
  {
    path: SERVICES_GENERAL_URL,
    component: <PageGeneralFeature />,
  },
  {
    path: SERVICES_DEPLOYMENTS_URL,
    component: <PageDeploymentsFeature />,
  },
  {
    path: `${SERVICES_SETTINGS_URL}/*`,
    component: <PageSettingsFeature />,
  },
]

export const ROUTER_ENVIRONMENTS_SETTINGS: Route[] = [
  {
    path: SERVICES_SETTINGS_GENERAL_URL,
    component: <PageSettingsGeneralFeature />,
  },
  {
    path: SERVICES_SETTINGS_DEPLOYMENT_URL,
    component: <PageSettingsV2 />,
  },
  {
    path: SERVICES_SETTINGS_PREVIEW_ENV_URL,
    component: <PageSettingsV2 />,
  },
  {
    path: SERVICES_SETTINGS_DANGER_ZONE_URL,
    component: <PageSettingsV2 />,
  },
  {
    path: SERVICES_SETTINGS_ADVANCED_SETTINGS_URL,
    component: <PageSettingsV2 />,
  },
]
