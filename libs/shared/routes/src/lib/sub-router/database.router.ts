export const DATABASE_URL = (
  organizationId = ':organizationId',
  projectId = ':projectId',
  environmentId = ':environmentId',
  databaseId = ':databaseId'
) => `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/database/${databaseId}`
export const DATABASE_GENERAL_URL = '/general'
export const DATABASE_DEPLOYMENTS_URL = '/deployments'
export const DATABASE_METRICS_URL = '/metrics'
export const DATABASE_SETTINGS_URL = '/settings'

export const DATABASE_SETTINGS_GENERAL_URL = '/general'
export const DATABASE_SETTINGS_RESOURCES_URL = '/resources'
export const DATABASE_SETTINGS_DANGER_ZONE_URL = '/danger-zone'
