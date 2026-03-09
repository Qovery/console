import {
  DATABASE_MONITORING_URL,
  DATABASE_SETTINGS_DANGER_ZONE_URL,
  DATABASE_SETTINGS_RESOURCES_URL,
  DATABASE_SETTINGS_URL,
  type Route,
} from '@qovery/shared/routes'
import PageMonitoringFeature from '../feature/page-monitoring-feature/page-monitoring-feature'
import PageSettingsDangerZoneFeature from '../feature/page-settings-danger-zone-feature/page-settings-danger-zone-feature'
import PageSettingsFeature from '../feature/page-settings-feature/page-settings-feature'
import PageSettingsResourcesFeature from '../feature/page-settings-resources-feature/page-settings-resources-feature'

export const ROUTER_DATABASE: Route[] = [
  {
    path: DATABASE_MONITORING_URL,
    component: <PageMonitoringFeature />,
  },
  {
    path: `${DATABASE_SETTINGS_URL}/*`,
    component: <PageSettingsFeature />,
  },
]

export const ROUTER_DATABASE_SETTINGS: Route[] = [
  {
    path: DATABASE_SETTINGS_RESOURCES_URL,
    component: <PageSettingsResourcesFeature />,
  },
  {
    path: DATABASE_SETTINGS_DANGER_ZONE_URL,
    component: <PageSettingsDangerZoneFeature />,
  },
]
