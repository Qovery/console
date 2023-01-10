import { CLUSTERS_GENERAL_URL, Route } from '@qovery/shared/routes'
import PageClustersGeneralFeature from '../feature/page-clusters-general-feature/page-clusters-general-feature'

export const ROUTER_CLUSTERS: Route[] = [
  {
    path: CLUSTERS_GENERAL_URL,
    component: <PageClustersGeneralFeature />,
  },
]
