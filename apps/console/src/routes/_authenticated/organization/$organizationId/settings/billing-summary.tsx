import { createFileRoute } from '@tanstack/react-router'
import { SettingsBillingSummary } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/billing-summary')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsBillingSummary />
}
