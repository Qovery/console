import { createFileRoute } from '@tanstack/react-router'
import { HelmNetworkingSettings } from '@qovery/domains/service-settings/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/networking'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <HelmNetworkingSettings />
}
