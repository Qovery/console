import {
  CLUSTERS_CREATION_FEATURES_URL,
  CLUSTERS_CREATION_GENERAL_URL,
  CLUSTERS_CREATION_REMOTE_URL,
  CLUSTERS_CREATION_RESOURCES_URL,
  CLUSTERS_CREATION_URL,
  CLUSTERS_GENERAL_URL,
  Route,
} from '@qovery/shared/routes'
import { PageClusterCreateFeature } from '../feature/page-clusters-create-feature/page-clusters-create-feature'
import StepFeaturesFeature from '../feature/page-clusters-create-feature/step-features-feature/step-features-feature'
import StepGeneralFeature from '../feature/page-clusters-create-feature/step-general-feature/step-general-feature'
import StepRemoteFeature from '../feature/page-clusters-create-feature/step-remote-feature/step-remote-feature'
import StepResourcesFeature from '../feature/page-clusters-create-feature/step-resources-feature/step-resources-feature'
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
  {
    path: CLUSTERS_CREATION_RESOURCES_URL,
    component: <StepResourcesFeature />,
  },
  {
    path: CLUSTERS_CREATION_FEATURES_URL,
    component: <StepFeaturesFeature />,
  },
  {
    path: CLUSTERS_CREATION_REMOTE_URL,
    component: <StepRemoteFeature />,
  },
]
