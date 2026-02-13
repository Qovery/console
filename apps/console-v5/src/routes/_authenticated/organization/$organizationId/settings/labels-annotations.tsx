import { createFileRoute } from '@tanstack/react-router'
import { PageOrganizationLabelsAnnotationsFeature } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/labels-annotations')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PageOrganizationLabelsAnnotationsFeature />
}
