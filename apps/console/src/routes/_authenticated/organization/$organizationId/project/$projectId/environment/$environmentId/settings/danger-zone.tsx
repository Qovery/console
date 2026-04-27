import { createFileRoute } from '@tanstack/react-router'
import { PageSettingsDangerZoneFeature } from '@qovery/domains/environments/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/settings/danger-zone'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <PageSettingsDangerZoneFeature />
}
