import {
  Route,
  SETTINGS_BILLING_URL,
  SETTINGS_CLUSTER_URL,
  SETTINGS_DANGER_ZONE_URL,
  SETTINGS_GENERAL_URL,
  SETTINGS_MEMBERS_URL,
} from '@qovery/shared/router'
import { PageOrganizationClusterFeature } from '../feature/page-organization-cluster-feature/page-organization-cluster-feature'
import { PageOrganizationDangerZoneFeature } from '../feature/page-organization-danger-zone-feature/page-organization-danger-zone-feature'
import { PageOrganizationGeneralFeature } from '../feature/page-organization-general-feature/page-organization-general-feature'
import PageSettingsV2 from '../ui/page-settings-v2/page-settings-v2'

export const ROUTER_SETTINGS: Route[] = [
  {
    path: SETTINGS_GENERAL_URL,
    component: <PageOrganizationGeneralFeature />,
  },
  {
    path: SETTINGS_MEMBERS_URL,
    component: <PageSettingsV2 path="members" />,
  },
  {
    path: SETTINGS_BILLING_URL,
    component: <PageSettingsV2 path="billing" />,
  },
  {
    path: SETTINGS_CLUSTER_URL,
    component: <PageOrganizationClusterFeature />,
  },
  {
    path: SETTINGS_DANGER_ZONE_URL,
    component: <PageOrganizationDangerZoneFeature />,
  },
]
