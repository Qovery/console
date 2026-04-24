import { createFileRoute } from '@tanstack/react-router'
import { EditDeploymentRule } from '@qovery/domains/projects/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/deployment-rules/edit/$deploymentRuleId'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <EditDeploymentRule />
}
