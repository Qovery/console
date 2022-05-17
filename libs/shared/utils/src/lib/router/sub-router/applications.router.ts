export const APPLICATIONS_URL = (
  organizationId = ':organizationId',
  projectId = ':projectId',
  environmentId = ':environmentId'
) => `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/applications`
export const APPLICATIONS_GENERAL_URL = '/general'
