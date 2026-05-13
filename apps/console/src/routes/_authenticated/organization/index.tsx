import { Navigate, createFileRoute } from '@tanstack/react-router'
import { useOrganizations } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: organizations = [] } = useOrganizations({ suspense: true })
  const organization = organizations[0]

  if (!organization) {
    return null
  }

  return <Navigate to="/organization/$organizationId/overview" params={{ organizationId: organization.id }} replace />
}
