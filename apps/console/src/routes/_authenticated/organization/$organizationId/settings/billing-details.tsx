import { createFileRoute } from '@tanstack/react-router'
import { BillingAccessGuard, SettingsBillingDetails } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/billing-details')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <BillingAccessGuard>
      <SettingsBillingDetails />
    </BillingAccessGuard>
  )
}
