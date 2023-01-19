import {
  CLUSTER_SETTINGS_ADVANCED_SETTINGS_URL,
  CLUSTER_SETTINGS_CREDENTIALS_URL,
  CLUSTER_SETTINGS_DANGER_ZONE_URL,
  CLUSTER_SETTINGS_FEATURES_URL,
  CLUSTER_SETTINGS_GENERAL_URL,
  CLUSTER_SETTINGS_NETWORK_URL,
  CLUSTER_SETTINGS_RESOURCES_URL,
  CLUSTER_SETTINGS_URL,
  Route,
} from '@qovery/shared/routes'
import PageSettingsAdvancedFeature from '../feature/page-settings-advanced-feature/page-settings-advanced-feature'
import { PageSettingsDangerZoneFeature } from '../feature/page-settings-danger-zone-feature/page-settings-danger-zone-feature'
import { PageSettingsFeature } from '../feature/page-settings-feature/page-settings-feature'
import PageSettingsGeneralFeature from '../feature/page-settings-general-feature/page-settings-general-feature'
import { PageSettingsV2 } from '../ui/page-settings-v2/page-settings-v2'

export const ROUTER_CLUSTER: Route[] = [
  {
    path: `${CLUSTER_SETTINGS_URL}/*`,
    component: <PageSettingsFeature />,
  },
]

export const ROUTER_CLUSTER_SETTINGS: Route[] = [
  {
    path: CLUSTER_SETTINGS_GENERAL_URL,
    component: <PageSettingsGeneralFeature />,
  },
  {
    path: CLUSTER_SETTINGS_CREDENTIALS_URL,
    component: <PageSettingsV2 />,
  },
  {
    path: CLUSTER_SETTINGS_RESOURCES_URL,
    component: <PageSettingsV2 />,
  },
  {
    path: CLUSTER_SETTINGS_FEATURES_URL,
    component: <PageSettingsV2 />,
  },
  {
    path: CLUSTER_SETTINGS_NETWORK_URL,
    component: <PageSettingsV2 />,
  },
  {
    path: CLUSTER_SETTINGS_ADVANCED_SETTINGS_URL,
    component: <PageSettingsAdvancedFeature />,
  },
  {
    path: CLUSTER_SETTINGS_DANGER_ZONE_URL,
    component: <PageSettingsDangerZoneFeature />,
  },
]
