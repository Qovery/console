export const ENVIRONMENTS_URL = (organizationId = ':organizationId', projectId = ':projectId') =>
  `/organization/${organizationId}/project/${projectId}/environments`
export const ENVIRONMENTS_GENERAL_URL = '/general'
export const ENVIRONMENTS_VARIABLES_URL = '/variables'
export const ENVIRONMENTS_DEPLOYMENT_RULES_URL = `/deployment-rules`
export const ENVIRONMENTS_DEPLOYMENT_RULES_CREATE_URL = '/deployment-rules/create'
export const ENVIRONMENTS_DEPLOYMENT_RULES_EDIT_URL = (deploymentRuleId = ':deploymentRuleId') =>
  `/deployment-rules/edit/${deploymentRuleId}`
export const ENVIRONMENTS_SETTINGS_GENERAL_URL = `/general`
