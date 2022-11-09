import { APPLICATION_URL } from './application.router'
import { SERVICES_URL } from './services.router'

export const INFRA_LOGS_URL = (organizationId = ':organizationId', clusterId = ':clusterId') =>
  `/organization/${organizationId}/cluster/${clusterId}/logs`

export const APPLICATION_LOGS_URL = (
  organizationId = ':organizationId',
  projectId = ':projectId',
  environmentId = ':environmentId',
  applicationId = ':applicationId'
) => `${APPLICATION_URL(organizationId, projectId, environmentId, applicationId)}/logs`

export const DEPLOYMENT_LOGS_URL = (
  organizationId = ':organizationId',
  projectId = ':projectId',
  environmentId = ':environmentId'
) => `${SERVICES_URL(organizationId, projectId, environmentId)}/logs`
