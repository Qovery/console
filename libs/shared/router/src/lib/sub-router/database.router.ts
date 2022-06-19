export const DATABASE_URL = (
  organizationId = ':organizationId',
  projectId = ':projectId',
  environmentId = ':environmentId',
  databaseId = ':databaseId'
) => `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/database/${databaseId}`
export const DATABASE_GENERAL_URL = '/general'
export const DATABASE_DEPLOYMENTS_URL = '/deployments'
export const DATABASE_METRICS_URL = '/metrics'
export const DATABASE_VARIABLES_URL = '/variables'
export const DATABASE_SETTINGS_URL = '/settings'
