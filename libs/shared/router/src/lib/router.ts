export * from './sub-router/application.router'
export * from './sub-router/services.router'
export * from './sub-router/environments.router'
export * from './sub-router/onboarding.router'

export const INDEX_URL = '/'
export const ORGANIZATION_URL = (organizationId = ':organizationId') => `/organization/${organizationId}`
export const OVERVIEW_URL = (organizationId = ':organizationId', projectId = ':projectId') =>
  `/organization/${organizationId}/project/${projectId}/overview`
export const LOGIN_URL = '/login'
export const SETTINGS_URL = (organizationId = ':organizationId') => `/organization/${organizationId}/settings`

export interface Route {
  component: React.ReactElement
  path: string
}
