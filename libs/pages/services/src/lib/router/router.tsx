import {
  type Route,
  SERVICES_CREATION_GENERAL_URL,
  SERVICES_CREATION_HEALTHCHECKS_URL,
  SERVICES_CREATION_PORTS_URL,
  SERVICES_CREATION_POST_URL,
  SERVICES_CREATION_RESOURCES_URL,
  SERVICES_CREATION_VARIABLES_URL,
  SERVICES_DATABASE_CREATION_GENERAL_URL,
  SERVICES_DATABASE_CREATION_POST_URL,
  SERVICES_DATABASE_CREATION_RESOURCES_URL,
  SERVICES_DEPLOYMENTS_URL,
  SERVICES_GENERAL_URL,
  SERVICES_HELM_CREATION_GENERAL_URL,
  SERVICES_HELM_CREATION_SUMMARY_URL,
  SERVICES_HELM_CREATION_VALUES_STEP_1_URL,
  SERVICES_HELM_CREATION_VALUES_STEP_2_URL,
  SERVICES_JOB_CREATION_CONFIGURE_URL,
  SERVICES_JOB_CREATION_DOCKERFILE_URL,
  SERVICES_JOB_CREATION_GENERAL_URL,
  SERVICES_JOB_CREATION_INTRODUCTION_URL,
  SERVICES_JOB_CREATION_POST_URL,
  SERVICES_JOB_CREATION_RESOURCES_URL,
  SERVICES_JOB_CREATION_VARIABLE_URL,
  SERVICES_NEW_URL,
  SERVICES_SETTINGS_DANGER_ZONE_URL,
  SERVICES_SETTINGS_GENERAL_URL,
  SERVICES_SETTINGS_PIPELINE_URL,
  SERVICES_SETTINGS_PREVIEW_ENV_URL,
  SERVICES_SETTINGS_RULES_URL,
  SERVICES_SETTINGS_URL,
  SERVICES_VARIABLES_URL,
} from '@qovery/shared/routes'
import { StepGeneralFeature as ApplicationStepGeneralFeature } from '../feature/page-application-create-feature/step-general-feature/step-general-feature'
import { StepHealthchecksFeature as ApplicationStepHealthchecksFeature } from '../feature/page-application-create-feature/step-healthchecks-feature/step-healthchecks-feature'
import { StepPortFeature as ApplicationStepPortFeature } from '../feature/page-application-create-feature/step-port-feature/step-port-feature'
import { StepResourcesFeature as ApplicationStepResourcesFeature } from '../feature/page-application-create-feature/step-resources-feature/step-resources-feature'
import { StepSummaryFeature as ApplicationStepSummaryFeature } from '../feature/page-application-create-feature/step-summary-feature/step-summary-feature'
import { StepVariableFeature as ApplicationStepVariablesFeature } from '../feature/page-application-create-feature/step-variable-feature/step-variable-feature'
import { StepGeneralFeature as DatabaseStepGeneralFeature } from '../feature/page-database-create-feature/step-general-feature/step-general-feature'
import { StepResourcesFeature as DatabaseStepResourcesFeature } from '../feature/page-database-create-feature/step-resources-feature/step-resources-feature'
import { StepSummaryFeature as DatabaseStepSummaryFeature } from '../feature/page-database-create-feature/step-summary-feature/step-summary-feature'
import PageDeploymentsFeature from '../feature/page-deployments-feature/page-deployments-feature'
import PageGeneralFeature from '../feature/page-general-feature/page-general-feature'
import { StepGeneralFeature as HelmStepGeneralFeature } from '../feature/page-helm-create-feature/step-general-feature/step-general-feature'
import { StepSummaryFeature as HelmStepSummaryFeature } from '../feature/page-helm-create-feature/step-summary-feature/step-summary-feature'
import { StepValuesOverrideArgumentsFeature as HelmStepValuesOverrideArgumentsFeature } from '../feature/page-helm-create-feature/step-values-override-arguments-feature/step-values-override-arguments-feature'
import { StepValuesOverrideFilesFeature as HelmStepValuesOverrideFilesFeature } from '../feature/page-helm-create-feature/step-values-override-files-feature/step-values-override-files-feature'
import { StepConfigureFeature } from '../feature/page-job-create-feature/step-configure-feature/step-configure-feature'
import { StepDockerfileFeature } from '../feature/page-job-create-feature/step-dockerfile-feature/step-dockerfile-feature'
import { StepGeneralFeature } from '../feature/page-job-create-feature/step-general-feature/step-general-feature'
import StepIntroductionFeature from '../feature/page-job-create-feature/step-introduction-feature/step-introduction-feature'
import { StepResourcesFeature } from '../feature/page-job-create-feature/step-resources-feature/step-resources-feature'
import { StepSummaryFeature } from '../feature/page-job-create-feature/step-summary-feature/step-summary-feature'
import { StepVariableFeature } from '../feature/page-job-create-feature/step-variable-feature/step-variable-feature'
import { PageNewFeature } from '../feature/page-new-feature/page-new-feature'
import PageSettingsDangerZoneFeature from '../feature/page-settings-danger-zone-feature/page-settings-danger-zone-feature'
import PageSettingsDeploymentPipelineFeature from '../feature/page-settings-deployment-pipeline-feature/page-settings-deployment-pipeline-feature'
import PageSettingsDeploymentRulesFeature from '../feature/page-settings-deployment-rules-feature/page-settings-deployment-rules-feature'
import { PageSettingsFeature } from '../feature/page-settings-feature/page-settings-feature'
import PageSettingsGeneralFeature from '../feature/page-settings-general-feature/page-settings-general-feature'
import PageSettingsPreviewEnvironmentsFeature from '../feature/page-settings-preview-environments-feature/page-settings-preview-environments-feature'
import { PageVariablesFeature } from '../feature/page-variables-feature/page-variables-feature'
import { Container } from '../ui/container/container'

export const ROUTER_SERVICES: Route[] = [
  {
    path: SERVICES_GENERAL_URL,
    component: (
      <Container>
        <PageGeneralFeature />
      </Container>
    ),
  },
  {
    path: SERVICES_DEPLOYMENTS_URL,
    component: (
      <Container>
        <PageDeploymentsFeature />
      </Container>
    ),
  },
  {
    path: SERVICES_VARIABLES_URL,
    component: (
      <Container>
        <PageVariablesFeature />
      </Container>
    ),
  },
  {
    path: `${SERVICES_SETTINGS_URL}/*`,
    component: (
      <Container>
        <PageSettingsFeature />
      </Container>
    ),
  },
  {
    path: SERVICES_NEW_URL,
    component: <PageNewFeature />,
  },
]

export const ROUTER_ENVIRONMENTS_SETTINGS: Route[] = [
  {
    path: SERVICES_SETTINGS_GENERAL_URL,
    component: <PageSettingsGeneralFeature />,
  },
  {
    path: SERVICES_SETTINGS_RULES_URL,
    component: <PageSettingsDeploymentRulesFeature />,
  },
  {
    path: SERVICES_SETTINGS_PIPELINE_URL,
    component: <PageSettingsDeploymentPipelineFeature />,
  },
  {
    path: SERVICES_SETTINGS_PREVIEW_ENV_URL,
    component: <PageSettingsPreviewEnvironmentsFeature />,
  },
  {
    path: SERVICES_SETTINGS_DANGER_ZONE_URL,
    component: <PageSettingsDangerZoneFeature />,
  },
]

export const ROUTER_SERVICE_CREATION: Route[] = [
  {
    path: SERVICES_CREATION_GENERAL_URL,
    component: <ApplicationStepGeneralFeature />,
  },
  {
    path: SERVICES_CREATION_RESOURCES_URL,
    component: <ApplicationStepResourcesFeature />,
  },
  {
    path: SERVICES_CREATION_PORTS_URL,
    component: <ApplicationStepPortFeature />,
  },
  {
    path: SERVICES_CREATION_HEALTHCHECKS_URL,
    component: <ApplicationStepHealthchecksFeature />,
  },
  {
    path: SERVICES_CREATION_POST_URL,
    component: <ApplicationStepSummaryFeature />,
  },
  {
    path: SERVICES_CREATION_VARIABLES_URL,
    component: <ApplicationStepVariablesFeature />,
  },
]

export const ROUTER_SERVICE_DATABASE_CREATION: Route[] = [
  {
    path: SERVICES_DATABASE_CREATION_GENERAL_URL,
    component: <DatabaseStepGeneralFeature />,
  },
  {
    path: SERVICES_DATABASE_CREATION_RESOURCES_URL,
    component: <DatabaseStepResourcesFeature />,
  },
  {
    path: SERVICES_DATABASE_CREATION_POST_URL,
    component: <DatabaseStepSummaryFeature />,
  },
]

export const ROUTER_SERVICE_JOB_CREATION: Route[] = [
  {
    path: SERVICES_JOB_CREATION_INTRODUCTION_URL,
    component: <StepIntroductionFeature />,
  },
  {
    path: SERVICES_JOB_CREATION_GENERAL_URL,
    component: <StepGeneralFeature />,
  },
  {
    path: SERVICES_JOB_CREATION_DOCKERFILE_URL,
    component: <StepDockerfileFeature />,
  },
  {
    path: SERVICES_JOB_CREATION_CONFIGURE_URL,
    component: <StepConfigureFeature />,
  },
  {
    path: SERVICES_JOB_CREATION_RESOURCES_URL,
    component: <StepResourcesFeature />,
  },

  {
    path: SERVICES_JOB_CREATION_VARIABLE_URL,
    component: <StepVariableFeature />,
  },
  {
    path: SERVICES_JOB_CREATION_POST_URL,
    component: <StepSummaryFeature />,
  },
]

export const ROUTER_SERVICE_HELM_CREATION: Route[] = [
  {
    path: SERVICES_HELM_CREATION_GENERAL_URL,
    component: <HelmStepGeneralFeature />,
  },
  {
    path: SERVICES_HELM_CREATION_VALUES_STEP_1_URL,
    component: <HelmStepValuesOverrideFilesFeature />,
  },
  {
    path: SERVICES_HELM_CREATION_VALUES_STEP_2_URL,
    component: <HelmStepValuesOverrideArgumentsFeature />,
  },
  {
    path: SERVICES_HELM_CREATION_SUMMARY_URL,
    component: <HelmStepSummaryFeature />,
  },
]
