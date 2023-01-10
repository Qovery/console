export const SETTINGS_URL = (organizationId = ':organizationId') => `/organization/${organizationId}/settings`
// organization settings
export const SETTINGS_GENERAL_URL = '/general'
export const SETTINGS_CONTAINER_REGISTRIES_URL = '/container-registries'
export const SETTINGS_MEMBERS_URL = '/members'
export const SETTINGS_ROLES_URL = '/roles'
export const SETTINGS_ROLES_EDIT_URL = (roleId = ':roleId') => `/roles/edit/${roleId}`
export const SETTINGS_BILLING_URL = '/billing'
export const SETTINGS_DANGER_ZONE_URL = '/danger-zone'
// project settings
export const SETTINGS_PROJECT_URL = (projectId = ':projectId') => `/${projectId}/project`
export const SETTINGS_PROJECT_GENERAL_URL = '/general'
export const SETTINGS_PROJECT_DANGER_ZONE_URL = '/danger-zone'
