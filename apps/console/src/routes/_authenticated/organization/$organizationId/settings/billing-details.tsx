import { createFileRoute } from '@tanstack/react-router'
import { SettingsBillingDetails } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/billing-details')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsBillingDetails />
}
