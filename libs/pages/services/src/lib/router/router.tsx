import PageApplicationCreatePortFeature from 'libs/pages/services/src/lib/feature/page-application-create-feature/page-application-create-port-feature/page-application-create-port-feature'
import {
  Route,
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_CREATION_GENERAL_URL,
  SERVICES_CREATION_PORTS_URL,
  SERVICES_CREATION_POST_URL,
  SERVICES_CREATION_RESOURCES_URL,
  SERVICES_CRONJOB_CREATION_URL,
  SERVICES_DATABASE_CREATION_GENERAL_URL,
  SERVICES_DATABASE_CREATION_POST_URL,
  SERVICES_DATABASE_CREATION_RESOURCES_URL,
  SERVICES_DATABASE_CREATION_URL,
  SERVICES_DEPLOYMENTS_URL,
  SERVICES_GENERAL_URL,
  SERVICES_JOB_CREATION_GENERAL_URL,
  SERVICES_JOB_CREATION_PORT_URL,
  SERVICES_JOB_CREATION_POST_URL,
  SERVICES_JOB_CREATION_RESOURCES_URL,
  SERVICES_JOB_CREATION_VARIABLE_URL,
  SERVICES_LIFECYCLE_CREATION_URL,
  SERVICES_SETTINGS_ADVANCED_SETTINGS_URL,
  SERVICES_SETTINGS_DANGER_ZONE_URL,
  SERVICES_SETTINGS_DEPLOYMENT_URL,
  SERVICES_SETTINGS_GENERAL_URL,
  SERVICES_SETTINGS_PREVIEW_ENV_URL,
  SERVICES_SETTINGS_URL,
} from '@qovery/shared/router'
import { PageApplicationCreateFeature } from '../feature/page-application-create-feature/page-application-create-feature'
import PageApplicationCreateGeneralFeature from '../feature/page-application-create-feature/page-application-create-general-feature/page-application-create-general-feature'
import PageApplicationCreateResourcesFeature from '../feature/page-application-create-feature/page-application-create-resources-feature/page-application-create-resources-feature'
import PageApplicationPostFeature from '../feature/page-application-create-feature/page-application-post-feature/page-application-post-feature'
import { PageDatabaseCreateFeature } from '../feature/page-database-create-feature/page-database-create-feature'
import PageDatabaseCreateGeneralFeature from '../feature/page-database-create-feature/page-database-create-general-feature/page-database-create-general-feature'
import PageDatabaseCreatePostFeature from '../feature/page-database-create-feature/page-database-create-post-feature/page-database-create-post-feature'
import PageDatabaseCreateResourcesFeature from '../feature/page-database-create-feature/page-database-create-resources-feature/page-database-create-resources-feature'
import PageDeploymentsFeature from '../feature/page-deployments-feature/page-deployments-feature'
import PageGeneralFeature from '../feature/page-general-feature/page-general-feature'
import GeneralFeature from '../feature/page-job-create-feature/general-feature/general-feature'
import PageJobCreateFeature from '../feature/page-job-create-feature/page-job-create-feature'
import PortFeature from '../feature/page-job-create-feature/port-feature/port-feature'
import PostFeature from '../feature/page-job-create-feature/post-feature/post-feature'
import ResourcesFeature from '../feature/page-job-create-feature/resources-feature/resources-feature'
import VariableFeature from '../feature/page-job-create-feature/variable-feature/variable-feature'
import PageSettingsDangerZoneFeature from '../feature/page-settings-danger-zone-feature/page-settings-danger-zone-feature'
import PageSettingsDeploymentFeature from '../feature/page-settings-deployment-feature/page-settings-deployment-feature'
import { PageSettingsFeature } from '../feature/page-settings-feature/page-settings-feature'
import PageSettingsGeneralFeature from '../feature/page-settings-general-feature/page-settings-general-feature'
import PageSettingsPreviewEnvironmentsFeature from '../feature/page-settings-preview-environments-feature/page-settings-preview-environments-feature'
import PageSettingsV2 from '../ui/page-settings-v2/page-settings-v2'

export const ROUTER_SERVICES: Route[] = [
  {
    path: SERVICES_GENERAL_URL,
    component: <PageGeneralFeature />,
  },
  {
    path: SERVICES_DEPLOYMENTS_URL,
    component: <PageDeploymentsFeature />,
  },
  {
    path: `${SERVICES_SETTINGS_URL}/*`,
    component: <PageSettingsFeature />,
  },
  {
    path: `${SERVICES_DATABASE_CREATION_URL}/*`,
    component: <PageDatabaseCreateFeature />,
  },
  {
    path: `${SERVICES_CRONJOB_CREATION_URL}/*`,
    component: <PageJobCreateFeature />,
  },
  {
    path: `${SERVICES_LIFECYCLE_CREATION_URL}/*`,
    component: <PageJobCreateFeature />,
  },
  {
    path: `${SERVICES_APPLICATION_CREATION_URL}/*`,
    component: <PageApplicationCreateFeature />,
  },
]

export const ROUTER_ENVIRONMENTS_SETTINGS: Route[] = [
  {
    path: SERVICES_SETTINGS_GENERAL_URL,
    component: <PageSettingsGeneralFeature />,
  },
  {
    path: SERVICES_SETTINGS_DEPLOYMENT_URL,
    component: <PageSettingsDeploymentFeature />,
  },
  {
    path: SERVICES_SETTINGS_PREVIEW_ENV_URL,
    component: <PageSettingsPreviewEnvironmentsFeature />,
  },
  {
    path: SERVICES_SETTINGS_ADVANCED_SETTINGS_URL,
    component: <PageSettingsV2 />,
  },
  {
    path: SERVICES_SETTINGS_DANGER_ZONE_URL,
    component: <PageSettingsDangerZoneFeature />,
  },
]

export const ROUTER_SERVICE_CREATION: Route[] = [
  {
    path: SERVICES_CREATION_GENERAL_URL,
    component: <PageApplicationCreateGeneralFeature />,
  },
  {
    path: SERVICES_CREATION_RESOURCES_URL,
    component: <PageApplicationCreateResourcesFeature />,
  },
  {
    path: SERVICES_CREATION_PORTS_URL,
    component: <PageApplicationCreatePortFeature />,
  },
  {
    path: SERVICES_CREATION_POST_URL,
    component: <PageApplicationPostFeature />,
  },
]

export const ROUTER_SERVICE_DATABASE_CREATION: Route[] = [
  {
    path: SERVICES_DATABASE_CREATION_GENERAL_URL,
    component: <PageDatabaseCreateGeneralFeature />,
  },
  {
    path: SERVICES_DATABASE_CREATION_RESOURCES_URL,
    component: <PageDatabaseCreateResourcesFeature />,
  },
  {
    path: SERVICES_DATABASE_CREATION_POST_URL,
    component: <PageDatabaseCreatePostFeature />,
  },
]

export const ROUTER_SERVICE_JOB_CREATION: Route[] = [
  {
    path: SERVICES_JOB_CREATION_GENERAL_URL,
    component: <GeneralFeature />,
  },
  {
    path: SERVICES_JOB_CREATION_RESOURCES_URL,
    component: <ResourcesFeature />,
  },
  {
    path: SERVICES_JOB_CREATION_PORT_URL,
    component: <PortFeature />,
  },
  {
    path: SERVICES_JOB_CREATION_VARIABLE_URL,
    component: <VariableFeature />,
  },
  {
    path: SERVICES_JOB_CREATION_POST_URL,
    component: <PostFeature />,
  },
]
