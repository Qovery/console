import { createFileRoute } from '@tanstack/react-router'
import { StepSummary } from '@qovery/domains/service-terraform/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/terraform/summary'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <StepSummary />
}
