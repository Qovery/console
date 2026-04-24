import { createFileRoute } from '@tanstack/react-router'
import { CreateDeploymentRule } from '@qovery/domains/projects/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/deployment-rules/create'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <CreateDeploymentRule />
}
