import { createFileRoute } from '@tanstack/react-router'
import { SettingsLabelsAnnotations } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/infrastructure/settings/labels-annotations'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsLabelsAnnotations />
}
