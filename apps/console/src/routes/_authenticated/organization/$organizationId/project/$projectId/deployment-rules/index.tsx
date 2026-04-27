import { createFileRoute } from '@tanstack/react-router'
import { DeploymentRules } from '@qovery/domains/projects/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/deployment-rules/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <DeploymentRules />
}
