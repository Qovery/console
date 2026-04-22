import { createFileRoute } from '@tanstack/react-router'
import { StepConfigure } from '@qovery/domains/service-job/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/configure'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Configure - Create Lifecycle Job')

  return <StepConfigure />
}
