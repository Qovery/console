import { createFileRoute } from '@tanstack/react-router'
import { SettingsInvoices } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/invoices')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsInvoices />
}
