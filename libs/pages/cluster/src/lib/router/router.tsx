import {
  CLUSTER_SETTINGS_ADVANCED_SETTINGS_URL,
  CLUSTER_SETTINGS_CREDENTIALS_URL,
  CLUSTER_SETTINGS_DANGER_ZONE_URL,
  CLUSTER_SETTINGS_FEATURES_URL,
  CLUSTER_SETTINGS_GENERAL_URL,
  CLUSTER_SETTINGS_IMAGE_REGISTRY_URL,
  CLUSTER_SETTINGS_KUBECONFIG_URL,
  CLUSTER_SETTINGS_NETWORK_URL,
  CLUSTER_SETTINGS_REMOTE_ACCESS_URL,
  CLUSTER_SETTINGS_RESOURCES_URL,
  CLUSTER_SETTINGS_URL,
  type Route,
} from '@qovery/shared/routes'
import PageSettingsAdvancedFeature from '../feature/page-settings-advanced-feature/page-settings-advanced-feature'
import PageSettingsCredentialsFeature from '../feature/page-settings-credentials-feature/page-settings-credentials-feature'
import { PageSettingsDangerZoneFeature } from '../feature/page-settings-danger-zone-feature/page-settings-danger-zone-feature'
import { PageSettingsFeature } from '../feature/page-settings-feature/page-settings-feature'
import PageSettingsFeaturesFeature from '../feature/page-settings-features-feature/page-settings-features-feature'
import PageSettingsGeneralFeature from '../feature/page-settings-general-feature/page-settings-general-feature'
import PageSettingsImageRegistryFeature from '../feature/page-settings-image-registry-feature/page-settings-image-registry-feature'
import { PageSettingsKubeconfigFeature } from '../feature/page-settings-kubeconfig-feature/page-settings-kubeconfig-feature'
import PageSettingsNetworkFeature from '../feature/page-settings-network-feature/page-settings-network-feature'
import PageSettingsRemoteFeature from '../feature/page-settings-remote-feature/page-settings-remote-feature'
import PageSettingsResourcesFeature from '../feature/page-settings-resources-feature/page-settings-resources-feature'
import Container from '../ui/container/container'

export const ROUTER_CLUSTER: Route[] = [
  {
    path: `${CLUSTER_SETTINGS_URL}/*`,
    component: (
      <Container>
        <PageSettingsFeature />
      </Container>
    ),
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
    path: CLUSTER_SETTINGS_FEATURES_URL,
    component: <PageSettingsFeaturesFeature />,
  },
  {
    path: CLUSTER_SETTINGS_REMOTE_ACCESS_URL,
    component: <PageSettingsRemoteFeature />,
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
    path: CLUSTER_SETTINGS_KUBECONFIG_URL,
    component: <PageSettingsKubeconfigFeature />,
  },
  {
    path: CLUSTER_SETTINGS_DANGER_ZONE_URL,
    component: <PageSettingsDangerZoneFeature />,
  },
]
