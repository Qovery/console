import { createFileRoute } from '@tanstack/react-router'
import { SettingsBillingSettings, redirectLegacyBillingEmailLinks } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/billing')({
  beforeLoad: ({ params, location }) =>
    redirectLegacyBillingEmailLinks({ params, search: new URL(location.publicHref, location.url).search }),
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsBillingSettings />
}
