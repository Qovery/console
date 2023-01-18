import {
  CLUSTERS_CREATION_GENERAL_URL,
  CLUSTERS_CREATION_URL,
  CLUSTERS_GENERAL_URL,
  Route,
} from '@qovery/shared/routes'
import PageClusterCreateFeature from '../feature/page-cluster-create-feature/page-application-create-feature'
import PageClustersGeneralFeature from '../feature/page-clusters-general-feature/page-clusters-general-feature'

export const ROUTER_CLUSTERS: Route[] = [
  {
    path: CLUSTERS_GENERAL_URL,
    component: <PageClustersGeneralFeature />,
  },
  {
    path: `${CLUSTERS_CREATION_URL}/*`,
    component: <PageClusterCreateFeature />,
  },
]

export const ROUTER_CLUSTER_CREATION: Route[] = [
  {
    path: CLUSTERS_CREATION_GENERAL_URL,
    component: <p>hello</p>,
    // component: <ApplicationStepGeneralFeature />,
  },
]
