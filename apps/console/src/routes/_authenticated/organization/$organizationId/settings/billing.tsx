import { createFileRoute } from '@tanstack/react-router'
import { SettingsBillingUsage } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/billing')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsBillingUsage />
}
