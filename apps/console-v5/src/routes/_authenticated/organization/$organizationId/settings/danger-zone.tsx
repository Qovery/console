import { createFileRoute } from '@tanstack/react-router'
import { SettingsDangerZone } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/danger-zone')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsDangerZone />
}
