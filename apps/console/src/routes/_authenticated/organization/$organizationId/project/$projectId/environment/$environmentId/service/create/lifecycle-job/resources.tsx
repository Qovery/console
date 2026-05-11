import { createFileRoute } from '@tanstack/react-router'
import { StepResources } from '@qovery/domains/service-job/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/resources'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Resources - Create Lifecycle Job')

  return <StepResources />
}
