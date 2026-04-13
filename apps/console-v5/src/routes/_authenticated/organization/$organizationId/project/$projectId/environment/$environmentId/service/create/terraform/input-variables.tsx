import { createFileRoute } from '@tanstack/react-router'
import { StepVariables } from '@qovery/domains/service-terraform/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/terraform/input-variables'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <StepVariables />
}
