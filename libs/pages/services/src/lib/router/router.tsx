import {
  Route,
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_DEPLOYMENTS_URL,
  SERVICES_GENERAL_URL,
  SERVICES_SETTINGS_ADVANCED_SETTINGS_URL,
  SERVICES_SETTINGS_DANGER_ZONE_URL,
  SERVICES_SETTINGS_DEPLOYMENT_URL,
  SERVICES_SETTINGS_GENERAL_URL,
  SERVICES_SETTINGS_PREVIEW_ENV_URL,
  SERVICES_SETTINGS_URL,
} from '@console/shared/router'
import PageApplicationCreateFeature from '../../../../application/src/lib/feature/page-application-create-feature/page-application-create-feature'
import PageDeploymentsFeature from '../feature/page-deployments-feature/page-deployments-feature'
import PageGeneralFeature from '../feature/page-general-feature/page-general-feature'
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
    path: SERVICES_APPLICATION_CREATION_URL,
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
