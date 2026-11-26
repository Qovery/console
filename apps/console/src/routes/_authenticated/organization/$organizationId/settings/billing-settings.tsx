import { createFileRoute } from '@tanstack/react-router'
import { SettingsBillingSettings } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/billing-settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsBillingSettings />
}
