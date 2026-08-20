export const SPOTLIGHT_ROUTES = {
  project: '/organization/$organizationId/infrastructure/project/$projectId',
  environment: '/organization/$organizationId/infrastructure/project/$projectId/environment/$environmentId',
  serviceOverview:
    '/organization/$organizationId/infrastructure/project/$projectId/environment/$environmentId/service/$serviceId/overview',
} as const

export const ORGANIZATION_SETTINGS_ROUTES = {
  containerRegistries: '/organization/$organizationId/infrastructure/settings/container-registries',
  helmRepositories: '/organization/$organizationId/infrastructure/settings/helm-repositories',
  gitRepositoryAccess: '/organization/$organizationId/infrastructure/settings/git-repository-access',
  webhook: '/organization/$organizationId/infrastructure/settings/webhook',
  apiToken: '/organization/$organizationId/infrastructure/settings/api-token',
  members: '/organization/$organizationId/infrastructure/settings/members',
} as const

export type OrganizationSettingsRoute = (typeof ORGANIZATION_SETTINGS_ROUTES)[keyof typeof ORGANIZATION_SETTINGS_ROUTES]
