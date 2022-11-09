import { APPLICATION_URL } from './application.router'

export const INFRA_LOGS_URL = (organizationId = ':organizationId', clusterId = ':clusterId') =>
  `/organization/${organizationId}/cluster/${clusterId}/logs`

export const APPLICATION_LOGS_URL = (
  organizationId = ':organizationId',
  projectId = ':projectId',
  environmentId = ':environmentId',
  applicationId = ':applicationId'
) => `${APPLICATION_URL(organizationId, projectId, environmentId, applicationId)}/logs`
