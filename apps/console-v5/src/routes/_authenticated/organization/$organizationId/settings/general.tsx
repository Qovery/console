import { createFileRoute } from '@tanstack/react-router'
import { PageOrganizationGeneralFeature } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/general')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PageOrganizationGeneralFeature />
}
