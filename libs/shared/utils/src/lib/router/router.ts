export const INDEX_URL = '/'
export const ORGANIZATION_URL = (organizationId = ':organizationId') => `/organization/${organizationId}`
export const OVERVIEW_URL = (organizationId = ':organizationId', projectId = ':projectId') =>
  `/organization/${organizationId}/project/${projectId}/overview`
export const LOGIN_URL = '/login'
export const ONBOARDING_URL = '/onboarding'
export const ONBOARDING_PERSONALIZE_URL = '/personalize'
export const ONBOARDING_MORE_URL = '/more'
export const ONBOARDING_PRICING_URL = '/pricing'
export const ONBOARDING_PRICING_FREE_URL = `${ONBOARDING_PRICING_URL}/free`
export const ONBOARDING_PRICING_PRO_URL = `${ONBOARDING_PRICING_URL}/professional`
export const ONBOARDING_PRICING_BUSINESS_URL = `${ONBOARDING_PRICING_URL}/business`
export const ONBOARDING_PRICING_ENTERPRISE_URL = `${ONBOARDING_PRICING_URL}/enterprise`
export const ONBOARDING_PROJECT_URL = '/project'
export const ONBOARDING_THANKS_URL = '/thanks'
export const SETTINGS_URL = (organizationId = ':organizationId') => `/organization/${organizationId}/settings`
export const ENVIRONMENTS_URL = (organizationId = ':organizationId', projectId = ':projectId') =>
  `/organization/${organizationId}/project/${projectId}/environments`
export const ENVIRONMENTS_DEPLOYMENT_RULES_URL = (organizationId = ':organizationId', projectId = ':projectId') =>
  `/organization/${organizationId}/project/${projectId}/environments/deployment-rules`
export const APPLICATIONS_URL = (
  organizationId = ':organizationId',
  projectId = ':projectId',
  environmentId = ':environmentId'
) => `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/applications`
export const APPLICATIONS_DEPLOYMENTS_URL = (
  organizationId = ':organizationId',
  projectId = ':projectId',
  environmentId = ':environmentId'
) => `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/applications/deployments`
export const APPLICATIONS_SETTINGS_URL = (
  organizationId = ':organizationId',
  projectId = ':projectId',
  environmentId = ':environmentId'
) => `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/applications/settings`
export const APPLICATION_URL = (
  organizationId = ':organizationId',
  projectId = ':projectId',
  environmentId = ':environmentId',
  applicationId = ':applicationId'
) =>
  `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/application/${applicationId}/general`
export const APPLICATION_DEPLOYMENTS_URL = (
  organizationId = ':organizationId',
  projectId = ':projectId',
  environmentId = ':environmentId',
  applicationId = ':applicationId'
) =>
  `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/application/${applicationId}/deployments`
export const APPLICATION_METRICS_URL = (
  organizationId = ':organizationId',
  projectId = ':projectId',
  environmentId = ':environmentId',
  applicationId = ':applicationId'
) =>
  `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/application/${applicationId}/metrics`
export const APPLICATION_VARIABLES_URL = (
  organizationId = ':organizationId',
  projectId = ':projectId',
  environmentId = ':environmentId',
  applicationId = ':applicationId'
) =>
  `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/application/${applicationId}/variables`
export const APPLICATION_SETTINGS_URL = (
  organizationId = ':organizationId',
  projectId = ':projectId',
  environmentId = ':environmentId',
  applicationId = ':applicationId'
) =>
  `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/application/${applicationId}/settings`

type ElementRoute = (
  organizationId?: string,
  projectId?: string,
  environmentId?: string,
  applicationId?: string
) => string
export interface Route {
  component: React.ReactElement
  path: string
}
