import { SERVICES_URL } from './services.router'

export const INFRA_LOGS_URL = (organizationId = ':organizationId', clusterId = ':clusterId') =>
  `/organization/${organizationId}/cluster/${clusterId}/logs`

export const ENVIRONMENT_LOGS_URL = (
  organizationId = ':organizationId',
  projectId = ':projectId',
  environmentId = ':environmentId'
) => `${SERVICES_URL(organizationId, projectId, environmentId)}/logs`

export const ENVIRONMENT_STAGES_URL = (versionId?: string) => (versionId ? `/stages/${versionId}` : '/stages')

export const SERVICE_LOGS_URL = (serviceId = ':serviceId', podName = '') =>
  `/${serviceId}/service-logs${podName ? `?pod_name=${podName}` : ''}`

export const DEPLOYMENT_LOGS_VERSION_URL = (serviceId = ':serviceId', versionId = ':versionId') =>
  `/${serviceId}/deployment-logs/${versionId}`

export const ENVIRONMENT_PRE_CHECK_LOGS_URL = (versionId: string) => `/pre-check-logs/${versionId}`
