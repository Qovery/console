import { createFileRoute, useParams } from '@tanstack/react-router'
import { OrganizationOverview } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/overview')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId } = useParams({ strict: false })

  if (!organizationId) {
    return null
  }

  return <OrganizationOverview />
}
