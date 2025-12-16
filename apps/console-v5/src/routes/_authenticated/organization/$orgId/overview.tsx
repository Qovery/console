import { createFileRoute, useParams } from '@tanstack/react-router'
import { OrganizationOverview } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$orgId/overview')({
  component: RouteComponent,
})

function RouteComponent() {
  const { orgId } = useParams({ strict: false })

  if (!orgId) {
    return null
  }

  return <OrganizationOverview />
}
