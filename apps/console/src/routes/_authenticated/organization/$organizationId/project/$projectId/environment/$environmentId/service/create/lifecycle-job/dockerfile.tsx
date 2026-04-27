import { createFileRoute } from '@tanstack/react-router'
import { StepDockerfile } from '@qovery/domains/service-job/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/dockerfile'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Dockerfile - Create Lifecycle Job')

  return <StepDockerfile />
}
