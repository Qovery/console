import { createFileRoute } from '@tanstack/react-router'
import { SettingsSlackIntegration } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/notifications/slack')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsSlackIntegration />
}
