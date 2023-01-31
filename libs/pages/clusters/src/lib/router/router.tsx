import {
  CLUSTERS_CREATION_GENERAL_URL,
  CLUSTERS_CREATION_URL,
  CLUSTERS_GENERAL_URL,
  Route,
} from '@qovery/shared/routes'
import { PageClusterCreateFeature } from '../feature/page-clusters-create-feature/page-clusters-create-feature'
import StepGeneralFeature from '../feature/page-clusters-create-feature/step-general-feature/step-general-feature'
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
    component: <StepGeneralFeature />,
  },
]
