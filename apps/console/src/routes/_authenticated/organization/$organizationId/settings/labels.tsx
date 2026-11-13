import { createFileRoute } from '@tanstack/react-router'
import { SettingsLabelsV2 } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/labels')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsLabelsV2 />
}
