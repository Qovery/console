import { SERVICES_URL } from './services.router'

export const INFRA_LOGS_URL = (organizationId = ':organizationId', clusterId = ':clusterId') =>
  `/organization/${organizationId}/cluster/${clusterId}/logs`

export const ENVIRONMENT_LOGS_URL = (
  organizationId = ':organizationId',
  projectId = ':projectId',
  environmentId = ':environmentId'
) => `${SERVICES_URL(organizationId, projectId, environmentId)}/logs`

export const SERVICE_LOGS_URL = (serviceId = ':serviceId') => `/${serviceId}/live-logs`

export const DEPLOYMENT_LOGS_URL = (serviceId = ':serviceId') => `/${serviceId}/deployment-logs`
