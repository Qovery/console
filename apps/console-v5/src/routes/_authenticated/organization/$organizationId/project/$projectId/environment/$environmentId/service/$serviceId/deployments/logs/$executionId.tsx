import { createFileRoute } from '@tanstack/react-router'
import { DeploymentLogs } from '@qovery/domains/service-logs/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments/logs/$executionId'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <DeploymentLogs />
}
