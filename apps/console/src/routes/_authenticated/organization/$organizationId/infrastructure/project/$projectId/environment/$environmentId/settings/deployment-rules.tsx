import { createFileRoute } from '@tanstack/react-router'
import { SettingsDeploymentRules } from '@qovery/domains/environments/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/infrastructure/project/$projectId/environment/$environmentId/settings/deployment-rules'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsDeploymentRules />
}
