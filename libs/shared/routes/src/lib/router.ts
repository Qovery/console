export * from './sub-router/application.router'
export * from './sub-router/database.router'
export * from './sub-router/services.router'
export * from './sub-router/environments.router'
export * from './sub-router/onboarding.router'
export * from './sub-router/login.router'
export * from './sub-router/settings.router'
export * from './sub-router/logs.router'
export * from './sub-router/clusters.router'
export * from './sub-router/job.router'

export const INDEX_URL = '/'
export const ACCEPT_INVITATION_URL = `/accept-invitation`
export const ORGANIZATION_URL = (organizationId = ':organizationId') => `/organization/${organizationId}`
export const OVERVIEW_URL = (organizationId = ':organizationId', projectId = ':projectId') =>
  `/organization/${organizationId}/project/${projectId}/overview`
export interface Route {
  component: React.ReactElement
  path: string
}
