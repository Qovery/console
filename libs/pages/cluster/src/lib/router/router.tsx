import {
  CLUSTER_SETTINGS_ADVANCED_SETTINGS_URL,
  CLUSTER_SETTINGS_CREDENTIALS_URL,
  CLUSTER_SETTINGS_DANGER_ZONE_URL,
  CLUSTER_SETTINGS_FEATURES_URL,
  CLUSTER_SETTINGS_GENERAL_URL,
  CLUSTER_SETTINGS_RESOURCES_URL,
  CLUSTER_SETTINGS_URL,
  Route,
} from '@qovery/shared/routes'
import PageSettingsFeature from '../feature/page-settings-feature/page-settings-feature'

export const ROUTER_CLUSTER: Route[] = [
  {
    path: CLUSTER_SETTINGS_URL,
    component: <PageSettingsFeature />,
  },
]

export const ROUTER_CLUSTER_SETTINGS: Route[] = [
  {
    path: CLUSTER_SETTINGS_GENERAL_URL,
    component: <p>hello</p>,
  },
  {
    path: CLUSTER_SETTINGS_CREDENTIALS_URL,
    component: <p>hello</p>,
  },
  {
    path: CLUSTER_SETTINGS_RESOURCES_URL,
    component: <p>hello</p>,
  },
  {
    path: CLUSTER_SETTINGS_FEATURES_URL,
    component: <p>hello</p>,
  },
  {
    path: CLUSTER_SETTINGS_ADVANCED_SETTINGS_URL,
    component: <p>hello</p>,
  },
  {
    path: CLUSTER_SETTINGS_DANGER_ZONE_URL,
    component: <p>hello</p>,
  },
]
