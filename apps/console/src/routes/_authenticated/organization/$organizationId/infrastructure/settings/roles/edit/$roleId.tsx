import { createFileRoute } from '@tanstack/react-router'
import { SettingsRolesEdit } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/infrastructure/settings/roles/edit/$roleId'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsRolesEdit />
}
