export const APPLICATION_URL = (
  organizationId = ':organizationId',
  projectId = ':projectId',
  environmentId = ':environmentId',
  applicationId = ':applicationId'
) => `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/application/${applicationId}`
export const APPLICATION_GENERAL_URL = '/general'
export const APPLICATION_DEPLOYMENTS_URL = '/deployments'
export const APPLICATION_METRICS_URL = '/metrics'
export const APPLICATION_VARIABLES_URL = '/variables'
export const APPLICATION_SETTINGS_URL = '/settings'

export const APPLICATION_SETTINGS_GENERAL_URL = '/general'
export const APPLICATION_SETTINGS_RESOURCES_URL = '/resources'
export const APPLICATION_SETTINGS_STORAGE_URL = '/storage'
export const APPLICATION_SETTINGS_DOMAIN_URL = '/domain'
export const APPLICATION_SETTINGS_PORT_URL = '/port'
export const APPLICATION_SETTINGS_ADVANCED_SETTINGS_URL = '/advanced-settings'
export const APPLICATION_SETTINGS_DANGER_ZONE_URL = '/danger-zone'

export const SERVICE_CREATION_GENERAL_URL = '/general'
