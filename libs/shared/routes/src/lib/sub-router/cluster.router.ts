export const CLUSTER_URL = (organizationId = ':organizationId', clusterId = ':clusterId') =>
  `/organization/${organizationId}/cluster/${clusterId}`

// settings
export const CLUSTER_SETTINGS_URL = '/settings'
export const CLUSTER_SETTINGS_GENERAL_URL = '/general'
export const CLUSTER_SETTINGS_CREDENTIALS_URL = '/credentials'
export const CLUSTER_SETTINGS_RESOURCES_URL = '/resources'
export const CLUSTER_SETTINGS_IMAGE_REGISTRY_URL = '/image-registry'
export const CLUSTER_SETTINGS_FEATURES_URL = '/features'
export const CLUSTER_SETTINGS_NETWORK_URL = '/network'
export const CLUSTER_SETTINGS_REMOTE_ACCESS_URL = '/remote-access'
export const CLUSTER_SETTINGS_ADVANCED_SETTINGS_URL = '/advanced-settings'
export const CLUSTER_SETTINGS_KUBECONFIG_URL = '/kubeconfig'
export const CLUSTER_SETTINGS_DANGER_ZONE_URL = '/danger-zone'
