export const CLUSTER_URL = (organizationId = ':organizationId', clusterId = ':clusterId') =>
  `/organization/${organizationId}/cluster/${clusterId}`

export const CLUSTER_OVERVIEW_URL = '/overview'

// settings
export const CLUSTER_SETTINGS_URL = '/settings'
export const CLUSTER_SETTINGS_GENERAL_URL = '/general'
export const CLUSTER_SETTINGS_CREDENTIALS_URL = '/credentials'
export const CLUSTER_SETTINGS_RESOURCES_URL = '/resources'
export const CLUSTER_SETTINGS_IMAGE_REGISTRY_URL = '/image-registry'
export const CLUSTER_SETTINGS_NETWORK_URL = '/network'
export const CLUSTER_SETTINGS_ADVANCED_SETTINGS_URL = '/advanced-settings'
export const CLUSTER_SETTINGS_DANGER_ZONE_URL = '/danger-zone'
