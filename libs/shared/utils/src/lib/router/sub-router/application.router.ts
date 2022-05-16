export const APPLICATION_URL = (
  organizationId = ':organizationId',
  projectId = ':projectId',
  environmentId = ':environmentId',
  applicationId = ':applicationId'
) => `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/application/${applicationId}`
export const APPLICATIONS_GENERAL_URL = '/general'
export const APPLICATIONS_DEPLOYMENTS_URL = '/deployments'
export const APPLICATIONS_METRICS_URL = '/metrics'
export const APPLICATIONS_VARIABLES_URL = '/variables'
export const APPLICATIONS_SETTINGS_URL = '/settings'
