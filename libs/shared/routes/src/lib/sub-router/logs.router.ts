import { SERVICES_URL } from './services.router'

export const INFRA_LOGS_URL = (organizationId = ':organizationId', clusterId = ':clusterId') =>
  `/organization/${organizationId}/cluster/${clusterId}/logs`

export const ENVIRONMENT_LOGS_URL = (
  organizationId = ':organizationId',
  projectId = ':projectId',
  environmentId = ':environmentId'
) => `${SERVICES_URL(organizationId, projectId, environmentId)}/logs`

export const ENVIRONMENT_STAGES_URL = (versionId?: string) => (versionId ? `/stages/${versionId}` : '/stages')

export const SERVICE_LOGS_URL = (
  serviceId = ':serviceId',
  instance = '',
  deploymentId = '',
  mode: 'live' | 'history' = 'live',
  startDate?: string,
  endDate?: string,
  level?: string
) => {
  const params = new URLSearchParams()
  if (instance) params.append('instance', instance)
  if (deploymentId) params.append('deploymentId', deploymentId)
  if (mode && mode !== 'live') params.append('mode', mode)
  if (startDate) params.append('startDate', startDate)
  if (endDate) params.append('endDate', endDate)
  if (level) params.append('level', level)
  const queryString = params.toString()
  return `/${serviceId}/service-logs${queryString ? `?${queryString}` : ''}`
}

export const DEPLOYMENT_LOGS_VERSION_URL = (serviceId = ':serviceId', versionId = ':versionId') =>
  `/${serviceId}/deployment-logs/${versionId}`

export const ENVIRONMENT_PRE_CHECK_LOGS_URL = (versionId: string) => `/pre-check-logs/${versionId}`
