export const ENVIRONMENTS_URL = (organizationId = ':organizationId', projectId = ':projectId') =>
  `/organization/${organizationId}/project/${projectId}/environments`
export const ENVIRONMENTS_GENERAL_URL = '/general'
export const ENVIRONMENTS_DEPLOYMENT_RULES_URL = `/deployment-rules`
export const ENVIRONMENTS_DEPLOYMENT_RULES_URL_CREATE = '/deployment-rules/create'
