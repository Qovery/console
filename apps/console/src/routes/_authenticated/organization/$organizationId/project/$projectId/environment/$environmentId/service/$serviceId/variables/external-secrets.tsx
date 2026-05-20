import { createFileRoute } from '@tanstack/react-router'
import { ExternalSecretsTab } from '@qovery/domains/services/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/variables/external-secrets'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <ExternalSecretsTab />
}
