import { createFileRoute } from '@tanstack/react-router'
import { SettingsBillingNotifications } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/notifications/billing')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsBillingNotifications />
}
