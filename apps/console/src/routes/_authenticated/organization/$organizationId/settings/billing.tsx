import { createFileRoute } from '@tanstack/react-router'
import { SettingsBillingUsage, redirectLegacyBillingEmailsLink } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/billing')({
  beforeLoad: ({ params, search }) => redirectLegacyBillingEmailsLink({ params, search }),
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsBillingUsage />
}
