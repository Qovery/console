import { createFileRoute } from '@tanstack/react-router'
import { SettingsMembers } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/members')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsMembers />
}
