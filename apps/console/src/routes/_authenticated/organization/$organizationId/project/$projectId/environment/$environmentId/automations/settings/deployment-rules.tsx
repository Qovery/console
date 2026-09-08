import { createFileRoute } from '@tanstack/react-router'
import { SettingsDeploymentRules } from '@qovery/domains/environments/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/automations/settings/deployment-rules'
)({ component: SettingsDeploymentRules })
