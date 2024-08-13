export const SERVICES_URL = (
  organizationId = ':organizationId',
  projectId = ':projectId',
  environmentId = ':environmentId'
) => `/organization/${organizationId}/project/${projectId}/environment/${environmentId}`
// had to ad this prefix so that we just the environment id in the URL, we can reach this router and the correct redirections
// without it our dx team can't just put `/organization/7b29c88a-a42c-4fe5-817f-038c1ef590e5/project/d83a2f1f-d90b-461f-9a45-5e8aa2fe2bc0/environment/857809d7-4e6e-4fa0-8f4e-aff1d8381028`
// they need to add /services to the URL which is not trivial
const prefix = '/services'
export const SERVICES_GENERAL_URL = prefix + '/general'
export const SERVICES_DEPLOYMENTS_URL = prefix + '/deployments'
export const SERVICES_VARIABLES_URL = prefix + '/variables'
export const SERVICES_SETTINGS_URL = prefix + '/settings'
export const SERVICES_NEW_URL = prefix + '/new'
export const SERVICES_SETTINGS_GENERAL_URL = prefix + `/general`
export const SERVICES_SETTINGS_RULES_URL = prefix + '/rules'
export const SERVICES_SETTINGS_PIPELINE_URL = prefix + '/pipeline'
export const SERVICES_SETTINGS_PREVIEW_ENV_URL = prefix + '/preview-environments'
export const SERVICES_SETTINGS_DANGER_ZONE_URL = prefix + '/danger-zone'
export const SERVICES_APPLICATION_CREATION_URL = prefix + '/create'
export const SERVICES_APPLICATION_TEMPLATE_CREATION_URL = (slug = ':slug', option = ':option') =>
  prefix + `/create/${slug}/${option}`
export const SERVICES_DATABASE_CREATION_URL = prefix + '/create/database'
export const SERVICES_DATABASE_TEMPLATE_CREATION_URL = (slug = ':slug', option = ':option') =>
  prefix + `/create/database/${slug}/${option}`

// subrouter for app/container steps /create/general /create/settings etc...
export const SERVICES_CREATION_GENERAL_URL = '/general'
export const SERVICES_CREATION_RESOURCES_URL = '/resources'
export const SERVICES_CREATION_PORTS_URL = '/ports'
export const SERVICES_CREATION_HEALTHCHECKS_URL = '/health-checks'
export const SERVICES_CREATION_POST_URL = '/post'
export const SERVICES_CREATION_VARIABLES_URL = '/variables'

// subrouter for database steps /create/general /create/settings etc...
export const SERVICES_DATABASE_CREATION_GENERAL_URL = '/general'
export const SERVICES_DATABASE_CREATION_RESOURCES_URL = '/resources'
export const SERVICES_DATABASE_CREATION_POST_URL = '/post'
