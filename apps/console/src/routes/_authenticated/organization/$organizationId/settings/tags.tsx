import { createFileRoute } from '@tanstack/react-router'
import { SettingsTags } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/tags')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsTags />
}
