import { Route, SETTINGS_CLUSTER_URL, SETTINGS_GENERAL_URL } from '@console/shared/router'
import PageOrganizationClusterFeature from '../feature/page-organization-cluster-feature/page-organization-cluster-feature'
import { PageOrganizationGeneralFeature } from '../feature/page-organization-general-feature/page-organization-general-feature'

export const ROUTER_SETTINGS: Route[] = [
  {
    path: SETTINGS_GENERAL_URL,
    component: <PageOrganizationGeneralFeature />,
  },
  {
    path: SETTINGS_CLUSTER_URL,
    component: <PageOrganizationClusterFeature />,
  },
]
