import {
  CLUSTER_OVERVIEW_URL,
  CLUSTER_SETTINGS_ADVANCED_SETTINGS_URL,
  CLUSTER_SETTINGS_CREDENTIALS_URL,
  CLUSTER_SETTINGS_DANGER_ZONE_URL,
  CLUSTER_SETTINGS_GENERAL_URL,
  CLUSTER_SETTINGS_IMAGE_REGISTRY_URL,
  CLUSTER_SETTINGS_NETWORK_URL,
  CLUSTER_SETTINGS_RESOURCES_URL,
  CLUSTER_SETTINGS_URL,
  type Route,
} from '@qovery/shared/routes'
import { PageOverviewFeature } from '../feature/page-overview-feature/page-overview-feature'
import PageSettingsAdvancedFeature from '../feature/page-settings-advanced-feature/page-settings-advanced-feature'
import PageSettingsCredentialsFeature from '../feature/page-settings-credentials-feature/page-settings-credentials-feature'
import { PageSettingsDangerZoneFeature } from '../feature/page-settings-danger-zone-feature/page-settings-danger-zone-feature'
import { PageSettingsFeature } from '../feature/page-settings-feature/page-settings-feature'
import PageSettingsGeneralFeature from '../feature/page-settings-general-feature/page-settings-general-feature'
import PageSettingsImageRegistryFeature from '../feature/page-settings-image-registry-feature/page-settings-image-registry-feature'
import PageSettingsNetworkFeature from '../feature/page-settings-network-feature/page-settings-network-feature'
import PageSettingsResourcesFeature from '../feature/page-settings-resources-feature/page-settings-resources-feature'

export const ROUTER_CLUSTER: Route[] = [
  {
    path: `${CLUSTER_SETTINGS_URL}/*`,
    component: <PageSettingsFeature />,
  },
  {
    path: CLUSTER_OVERVIEW_URL,
    component: <PageOverviewFeature />,
  },
]

export const ROUTER_CLUSTER_SETTINGS: Route[] = [
  {
    path: CLUSTER_SETTINGS_GENERAL_URL,
    component: <PageSettingsGeneralFeature />,
  },
  {
    path: CLUSTER_SETTINGS_CREDENTIALS_URL,
    component: <PageSettingsCredentialsFeature />,
  },
  {
    path: CLUSTER_SETTINGS_RESOURCES_URL,
    component: <PageSettingsResourcesFeature />,
  },
  {
    path: CLUSTER_SETTINGS_IMAGE_REGISTRY_URL,
    component: <PageSettingsImageRegistryFeature />,
  },
  {
    path: CLUSTER_SETTINGS_NETWORK_URL,
    component: <PageSettingsNetworkFeature />,
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
