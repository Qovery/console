import { createFileRoute } from '@tanstack/react-router'
import { JobDockerfileSettings } from '@qovery/domains/service-settings/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/dockerfile'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <JobDockerfileSettings />
}
