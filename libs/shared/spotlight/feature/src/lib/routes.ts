export const SPOTLIGHT_ROUTES = {
  project: '/organization/$organizationId/project/$projectId',
  environment: '/organization/$organizationId/project/$projectId/environment/$environmentId',
  serviceOverview:
    '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview',
} as const

export const ORGANIZATION_SETTINGS_ROUTES = {
  containerRegistries: '/organization/$organizationId/settings/container-registries',
  helmRepositories: '/organization/$organizationId/settings/helm-repositories',
  gitRepositoryAccess: '/organization/$organizationId/settings/git-repository-access',
  webhook: '/organization/$organizationId/settings/webhook',
  apiToken: '/organization/$organizationId/settings/api-token',
  members: '/organization/$organizationId/settings/members',
} as const

export type OrganizationSettingsRoute = (typeof ORGANIZATION_SETTINGS_ROUTES)[keyof typeof ORGANIZATION_SETTINGS_ROUTES]
