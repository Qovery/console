export const SERVICES_URL = (
  organizationId = ':organizationId',
  projectId = ':projectId',
  environmentId = ':environmentId'
) => `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/services`
export const SERVICES_GENERAL_URL = '/general'
export const SERVICES_DEPLOYMENTS_URL = '/deployments'
