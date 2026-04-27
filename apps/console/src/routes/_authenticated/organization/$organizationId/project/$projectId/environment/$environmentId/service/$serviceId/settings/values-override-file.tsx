import { createFileRoute } from '@tanstack/react-router'
import { HelmValuesOverrideFileSettings } from '@qovery/domains/service-settings/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/values-override-file'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <HelmValuesOverrideFileSettings />
}
