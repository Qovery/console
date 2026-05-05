import { createFileRoute } from '@tanstack/react-router'
import { SettingsWebhook } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/webhook')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsWebhook />
}
