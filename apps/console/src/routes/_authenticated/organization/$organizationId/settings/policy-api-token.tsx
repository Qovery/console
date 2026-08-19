import { createFileRoute } from '@tanstack/react-router'
import { SettingsPolicyApiToken } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/policy-api-token')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsPolicyApiToken />
}
