import { useAuth0 } from '@auth0/auth0-react'
import { Navigate, createFileRoute } from '@tanstack/react-router'
import { useOrganizations } from '@qovery/domains/organizations/feature'
import { queries } from '@qovery/state/util-queries'

export const Route = createFileRoute('/')({
  component: Index,
  loader: async ({ context }) => {
    // Preload data (organizations) without waiting for the queries to complete
    context.queryClient.prefetchQuery({
      ...queries.organizations.list,
    })
  },
})

function Index() {
  const { isAuthenticated } = useAuth0()
  const { data: organizations = [] } = useOrganizations({ enabled: true, suspense: true })

  // Redirect to latest selected organization
  const currentOrganizationId = localStorage.getItem('currentOrganizationId') || ''
  const latestSelectedOrganization =
    organizations.find((organization) => organization.id === currentOrganizationId) || organizations[0]
  if (latestSelectedOrganization) {
    return (
      <Navigate
        to="/organization/$organizationId/overview"
        params={{ organizationId: latestSelectedOrganization.id }}
      />
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: '/' }} />
  }

  return (
    <div className="p-2">
      <h3 className="text-neutral">Welcome Home!</h3>
    </div>
  )
}
