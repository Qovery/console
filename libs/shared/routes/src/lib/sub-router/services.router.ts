export const SERVICES_URL = (
  organizationId = ':organizationId',
  projectId = ':projectId',
  environmentId = ':environmentId'
) => `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/services`
export const SERVICES_GENERAL_URL = '/general'
export const SERVICES_DEPLOYMENTS_URL = '/deployments'
export const SERVICES_SETTINGS_URL = '/settings'
export const SERVICES_SETTINGS_GENERAL_URL = `/general`
export const SERVICES_SETTINGS_DEPLOYMENT_URL = '/deployment'
export const SERVICES_SETTINGS_PREVIEW_ENV_URL = '/preview-environments'
export const SERVICES_SETTINGS_ADVANCED_SETTINGS_URL = '/advanced-settings'
export const SERVICES_SETTINGS_DANGER_ZONE_URL = '/danger-zone'
export const SERVICES_APPLICATION_CREATION_URL = '/create'
export const SERVICES_DATABASE_CREATION_URL = '/create/database'

// subrouter for app/container steps /create/general /create/settings etc...
export const SERVICES_CREATION_GENERAL_URL = '/general'
export const SERVICES_CREATION_RESOURCES_URL = '/resources'
export const SERVICES_CREATION_PORTS_URL = '/ports'
export const SERVICES_CREATION_POST_URL = '/post'

// subrouter for database steps /create/general /create/settings etc...
export const SERVICES_DATABASE_CREATION_GENERAL_URL = '/general'
export const SERVICES_DATABASE_CREATION_RESOURCES_URL = '/resources'
export const SERVICES_DATABASE_CREATION_POST_URL = '/post'
