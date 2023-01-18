export const CLUSTERS_URL = (organizationId = ':organizationId') => `/organization/${organizationId}/clusters`
export const CLUSTERS_GENERAL_URL = '/general'
export const CLUSTERS_CREATION_URL = '/create'

export const CLUSTER_URL = (organizationId = ':organizationId', clusterId = ':clusterId') =>
  `/organization/${organizationId}/cluster/${clusterId}`

// subrouter for cluster create steps /create/general /create/settings etc...
export const CLUSTERS_CREATION_GENERAL_URL = '/general'

// settings
export const CLUSTER_SETTINGS_URL = '/settings'
export const CLUSTER_SETTINGS_GENERAL_URL = '/general'
export const CLUSTER_SETTINGS_CREDENTIALS_URL = '/credentials'
export const CLUSTER_SETTINGS_RESOURCES_URL = '/resources'
export const CLUSTER_SETTINGS_FEATURES_URL = '/features'
export const CLUSTER_SETTINGS_NETWORK_URL = '/network'
export const CLUSTER_SETTINGS_ADVANCED_SETTINGS_URL = '/advanced-settings'
export const CLUSTER_SETTINGS_DANGER_ZONE_URL = '/danger-zone'
