import {
  APPLICATION_SETTINGS_ADVANCED_SETTINGS_URL,
  APPLICATION_SETTINGS_DANGER_ZONE_URL,
  APPLICATION_SETTINGS_DOCKERFILE_URL,
  APPLICATION_SETTINGS_NETWORKING_URL,
  APPLICATION_SETTINGS_TERRAFORM_ARGUMENTS_URL,
  APPLICATION_SETTINGS_TERRAFORM_CONFIGURATION_URL,
  APPLICATION_SETTINGS_TERRAFORM_VARIABLES_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_SETTINGS_VALUES_OVERRIDE_ARGUMENTS_URL,
  APPLICATION_SETTINGS_VALUES_OVERRIDE_FILE_URL,
  APPLICATION_VARIABLES_URL,
  type Route,
} from '@qovery/shared/routes'
import PageSettingsAdvancedFeature from '../feature/page-settings-advanced-feature/page-settings-advanced-feature'
import PageSettingsDangerZoneFeature from '../feature/page-settings-danger-zone-feature/page-settings-danger-zone-feature'
import { PageSettingsDockerfileFeature } from '../feature/page-settings-dockerfile-feature/page-settings-dockerfile-feature'
import { PageSettingsFeature } from '../feature/page-settings-feature/page-settings-feature'
import { PageSettingsNetworkingFeature } from '../feature/page-settings-networking-feature/page-settings-networking-feature'
import { PageSettingsTerraformArgumentsFeature } from '../feature/page-settings-terraform-arguments-feature/page-settings-terraform-arguments-feature'
import PageSettingsTerraformConfigurationFeature from '../feature/page-settings-terraform-configuration-feature/page-settings-terraform-configuration-feature'
import { PageSettingsTerraformVariablesFeature } from '../feature/page-settings-terraform-variables/page-settings-terraform-variables'
import PageSettingsValuesOverrideArgumentsFeature from '../feature/page-settings-values-override-arguments-feature/page-settings-values-override-arguments-feature'
import PageSettingsValuesOverrideFileFeature from '../feature/page-settings-values-override-file-feature/page-settings-values-override-file-feature'
import PageVariablesFeature from '../feature/page-variables-feature/page-variables-feature'

export const ROUTER_APPLICATION: Route[] = [
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
    path: APPLICATION_SETTINGS_DOCKERFILE_URL,
    component: <PageSettingsDockerfileFeature />,
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
  {
    path: APPLICATION_SETTINGS_TERRAFORM_CONFIGURATION_URL,
    component: <PageSettingsTerraformConfigurationFeature />,
  },
  {
    path: APPLICATION_SETTINGS_TERRAFORM_ARGUMENTS_URL,
    component: <PageSettingsTerraformArgumentsFeature />,
  },
  {
    path: APPLICATION_SETTINGS_TERRAFORM_VARIABLES_URL,
    component: <PageSettingsTerraformVariablesFeature />,
  },
]
