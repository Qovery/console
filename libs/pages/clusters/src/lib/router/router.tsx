import {
  CLUSTERS_CREATION_FEATURES_URL,
  CLUSTERS_CREATION_GENERAL_URL,
  CLUSTERS_CREATION_KUBECONFIG_URL,
  CLUSTERS_CREATION_REMOTE_URL,
  CLUSTERS_CREATION_RESOURCES_URL,
  CLUSTERS_CREATION_SUMMARY_URL,
  CLUSTERS_GENERAL_URL,
  CLUSTERS_NEW_URL,
  type Route,
} from '@qovery/shared/routes'
import StepFeaturesFeature from '../feature/page-clusters-create-feature/step-features-feature/step-features-feature'
import StepGeneralFeature from '../feature/page-clusters-create-feature/step-general-feature/step-general-feature'
import StepKubeconfigFeature from '../feature/page-clusters-create-feature/step-kubeconfig-feature/step-kubeconfig-feature'
import StepRemoteFeature from '../feature/page-clusters-create-feature/step-remote-feature/step-remote-feature'
import StepResourcesFeature from '../feature/page-clusters-create-feature/step-resources-feature/step-resources-feature'
import StepSummaryFeature from '../feature/page-clusters-create-feature/step-summary-feature/step-summary-feature'
import PageClustersGeneralFeature from '../feature/page-clusters-general-feature/page-clusters-general-feature'
import { PageNewFeature } from '../feature/page-new-feature/page-new-feature'

export const ROUTER_CLUSTERS: Route[] = [
  {
    path: CLUSTERS_GENERAL_URL,
    component: <PageClustersGeneralFeature />,
  },
  {
    path: CLUSTERS_NEW_URL,
    component: <PageNewFeature />,
  },
]

export const ROUTER_CLUSTER_CREATION: Route[] = [
  {
    path: CLUSTERS_CREATION_GENERAL_URL,
    component: <StepGeneralFeature />,
  },
  {
    path: CLUSTERS_CREATION_KUBECONFIG_URL,
    component: <StepKubeconfigFeature />,
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
  {
    path: CLUSTERS_CREATION_SUMMARY_URL,
    component: <StepSummaryFeature />,
  },
]
