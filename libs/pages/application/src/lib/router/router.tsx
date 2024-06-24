import {
  APPLICATION_DEPLOYMENTS_URL,
  APPLICATION_GENERAL_URL,
  APPLICATION_SETTINGS_ADVANCED_SETTINGS_URL,
  APPLICATION_SETTINGS_CONFIGURE_URL,
  APPLICATION_SETTINGS_DANGER_ZONE_URL,
  APPLICATION_SETTINGS_DEPLOYMENT_RESTRICTIONS,
  APPLICATION_SETTINGS_DOCKERFILE_URL,
  APPLICATION_SETTINGS_DOMAIN_URL,
  APPLICATION_SETTINGS_GENERAL_URL,
  APPLICATION_SETTINGS_HEALTHCHECKS_URL,
  APPLICATION_SETTINGS_NETWORKING_URL,
  APPLICATION_SETTINGS_PORT_URL,
  APPLICATION_SETTINGS_RESOURCES_URL,
  APPLICATION_SETTINGS_STORAGE_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_SETTINGS_VALUES_OVERRIDE_ARGUMENTS_URL,
  APPLICATION_SETTINGS_VALUES_OVERRIDE_FILE_URL,
  APPLICATION_VARIABLES_URL,
  type Route,
} from '@qovery/shared/routes'
import PageDeploymentsFeature from '../feature/page-deployments-feature/page-deployments-feature'
import PageGeneralFeature from '../feature/page-general-feature/page-general-feature'
import PageSettingsAdvancedFeature from '../feature/page-settings-advanced-feature/page-settings-advanced-feature'
import PageSettingsConfigureJobFeature from '../feature/page-settings-configure-job-feature/page-settings-configure-job-feature'
import PageSettingsDangerZoneFeature from '../feature/page-settings-danger-zone-feature/page-settings-danger-zone-feature'
import PageSettingsDeploymentRestrictionsFeature from '../feature/page-settings-deployment-restrictions-feature/page-settings-deployment-restrictions-feature'
import { PageSettingsDockerfileFeature } from '../feature/page-settings-dockerfile-feature/page-settings-dockerfile-feature'
import PageSettingsDomainsFeature from '../feature/page-settings-domains-feature/page-settings-domains-feature'
import { PageSettingsFeature } from '../feature/page-settings-feature/page-settings-feature'
import PageSettingsGeneralFeature from '../feature/page-settings-general-feature/page-settings-general-feature'
import PageSettingsHealthchecksFeature from '../feature/page-settings-healthchecks-feature/page-settings-healthchecks-feature'
import { PageSettingsNetworkingFeature } from '../feature/page-settings-networking-feature/page-settings-networking-feature'
import PageSettingsPortsFeature from '../feature/page-settings-ports-feature/page-settings-ports-feature'
import PageSettingsResourcesFeature from '../feature/page-settings-resources-feature/page-settings-resources-feature'
import PageSettingsStorageFeature from '../feature/page-settings-storage-feature/page-settings-storage-feature'
import PageSettingsValuesOverrideArgumentsFeature from '../feature/page-settings-values-override-arguments-feature/page-settings-values-override-arguments-feature'
import PageSettingsValuesOverrideFileFeature from '../feature/page-settings-values-override-file-feature/page-settings-values-override-file-feature'
import PageVariablesFeature from '../feature/page-variables-feature/page-variables-feature'

export const ROUTER_APPLICATION: Route[] = [
  {
    path: APPLICATION_GENERAL_URL,
    component: <PageGeneralFeature />,
  },
  {
    path: APPLICATION_DEPLOYMENTS_URL,
    component: <PageDeploymentsFeature />,
  },
  {
    path: APPLICATION_VARIABLES_URL,
    component: <PageVariablesFeature />,
  },
  {
    path: `${APPLICATION_SETTINGS_URL}/*`,
    component: <PageSettingsFeature />,
  },
]

export const ROUTER_APPLICATION_SETTINGS: Route[] = [
  {
    path: APPLICATION_SETTINGS_GENERAL_URL,
    component: <PageSettingsGeneralFeature />,
  },
  {
    path: APPLICATION_SETTINGS_DOCKERFILE_URL,
    component: <PageSettingsDockerfileFeature />,
  },
  {
    path: APPLICATION_SETTINGS_CONFIGURE_URL,
    component: <PageSettingsConfigureJobFeature />,
  },
  {
    path: APPLICATION_SETTINGS_RESOURCES_URL,
    component: <PageSettingsResourcesFeature />,
  },
  {
    path: APPLICATION_SETTINGS_STORAGE_URL,
    component: <PageSettingsStorageFeature />,
  },
  {
    path: APPLICATION_SETTINGS_PORT_URL,
    component: <PageSettingsPortsFeature />,
  },
  {
    path: APPLICATION_SETTINGS_DOMAIN_URL,
    component: <PageSettingsDomainsFeature />,
  },
  {
    path: APPLICATION_SETTINGS_HEALTHCHECKS_URL,
    component: <PageSettingsHealthchecksFeature />,
  },
  {
    path: APPLICATION_SETTINGS_DEPLOYMENT_RESTRICTIONS,
    component: <PageSettingsDeploymentRestrictionsFeature />,
  },
  {
    path: APPLICATION_SETTINGS_ADVANCED_SETTINGS_URL,
    component: <PageSettingsAdvancedFeature />,
  },
  {
    path: APPLICATION_SETTINGS_VALUES_OVERRIDE_FILE_URL,
    component: <PageSettingsValuesOverrideFileFeature />,
  },
  {
    path: APPLICATION_SETTINGS_VALUES_OVERRIDE_ARGUMENTS_URL,
    component: <PageSettingsValuesOverrideArgumentsFeature />,
  },
  {
    path: APPLICATION_SETTINGS_NETWORKING_URL,
    component: <PageSettingsNetworkingFeature />,
  },
  {
    path: APPLICATION_SETTINGS_DANGER_ZONE_URL,
    component: <PageSettingsDangerZoneFeature />,
  },
]
