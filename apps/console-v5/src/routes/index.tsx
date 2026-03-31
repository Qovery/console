import { useAuth0 } from '@auth0/auth0-react'
import { Navigate, createFileRoute } from '@tanstack/react-router'
import { useOrganizations } from '@qovery/domains/organizations/feature'
import { queries } from '@qovery/state/util-queries'
import { NotFoundPage } from '../app/components/not-found-page/not-found-page'

export const Route = createFileRoute('/')({
  component: Index,
  notFoundComponent: NotFoundPage,
  loader: async ({ context }) => {
    // Preload data (organizations) without waiting for the queries to complete
    if (context.auth.isAuthenticated) {
      context.queryClient.prefetchQuery({
        ...queries.organizations.list,
      })
    }
  },
})

function Index() {
  const { isAuthenticated } = useAuth0()
  const { data: organizations = [] } = useOrganizations({ enabled: isAuthenticated, suspense: true })

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

  return <Navigate to="/login" search={{ redirect: '/' }} />
}
