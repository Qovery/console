import { createFileRoute } from '@tanstack/react-router'
import { SettingsApiToken } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/api-token')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsApiToken />
}
