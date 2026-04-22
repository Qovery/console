import { createFileRoute } from '@tanstack/react-router'
import { JobDockerfileSettings } from '@qovery/domains/service-settings/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/dockerfile'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Dockerfile - Service settings')

  return <JobDockerfileSettings />
}
