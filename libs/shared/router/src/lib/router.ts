export * from './sub-router/application.router'
export * from './sub-router/database.router'
export * from './sub-router/services.router'
export * from './sub-router/environments.router'
export * from './sub-router/onboarding.router'
export * from './sub-router/login.router'
export * from './sub-router/settings.router'

export const INDEX_URL = '/'
export const ORGANIZATION_URL = (organizationId = ':organizationId') => `/organization/${organizationId}`
export const OVERVIEW_URL = (organizationId = ':organizationId', projectId = ':projectId') =>
  `/organization/${organizationId}/project/${projectId}/overview`
export const NO_BETA_ACCESS_URL = '/no-beta-access'
export const INFRA_LOGS_URL = (organizationId = ':organizationId', clusterId = ':clusterId') =>
  `/organization/${organizationId}/cluster/${clusterId}/logs`
export interface Route {
  component: React.ReactElement
  path: string
}
