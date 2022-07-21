import {
  DATABASE_DEPLOYMENTS_URL,
  DATABASE_GENERAL_URL,
  DATABASE_SETTINGS_DANGER_ZONE_URL,
  DATABASE_SETTINGS_GENERAL_URL,
  DATABASE_SETTINGS_RESOURCES_URL,
  DATABASE_SETTINGS_URL,
  DATABASE_VARIABLES_URL,
  Route,
} from '@console/shared/router'
import PageGeneralFeature from '../feature/page-general-feature/page-general-feature'
import PageDeploymentsFeature from '../feature/page-deployments-feature/page-deployments-feature'
import PageVariablesFeature from '../feature/page-variables-feature/page-variables-feature'
import PageSettingsDangerZoneFeature from '../feature/page-settings-danger-zone-feature/page-settings-danger-zone-feature'
import PageSettingsFeature from '../feature/page-settings-feature/page-settings-feature'

import PageSettingsV2 from '../ui/page-settings-v2/page-settings-v2'

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
    path: `${DATABASE_SETTINGS_URL}/*`,
    component: <PageSettingsFeature />,
  },
]

export const ROUTER_DATABASE_SETTINGS: Route[] = [
  {
    path: DATABASE_SETTINGS_GENERAL_URL,
    component: <PageSettingsV2 />,
  },
  {
    path: DATABASE_SETTINGS_RESOURCES_URL,
    component: <PageSettingsV2 />,
  },
  {
    path: DATABASE_SETTINGS_DANGER_ZONE_URL,
    component: <PageSettingsDangerZoneFeature />,
  },
]
