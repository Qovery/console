import { type ReactElement } from 'react'

export * from './sub-router/application.router'
export * from './sub-router/database.router'
export * from './sub-router/services.router'
export * from './sub-router/environments.router'
export * from './sub-router/onboarding.router'
export * from './sub-router/login.router'
export * from './sub-router/settings.router'
export * from './sub-router/logs.router'
export * from './sub-router/clusters.router'
export * from './sub-router/cluster.router'
export * from './sub-router/job.router'
export * from './sub-router/helm.router'
export * from './sub-router/audit-logs.router'
export * from './sub-router/user.router'

export const INDEX_URL = '/'
export const PREVIEW_CODE = '/preview-code'
export const HELM_DEFAULT_VALUES = '/helm-default-values'
export const KUBECONFIG = '/kubeconfig'
export const ACCEPT_INVITATION_URL = `/accept-invitation`
export const GITHUB_APPLICATION_CALLBACK_URL = `/github-application-callback`
export const ORGANIZATION_URL = (organizationId = ':organizationId') => `/organization/${organizationId}`
export const ORGANIZATION_PROJECT_URL = '/project'
export const ORGANIZATION_AUDIT_LOGS_URL = '/audit-logs'

export const OVERVIEW_URL = (organizationId = ':organizationId', projectId = ':projectId') =>
  `/organization/${organizationId}/project/${projectId}/overview`
export interface Route {
  component: ReactElement
  path: string
}
