import { useAuth0 } from '@auth0/auth0-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Navigate, createFileRoute } from '@tanstack/react-router'
import { organizationsQuery } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/')({
  component: Index,
  loader: ({ context }) => context.queryClient.ensureQueryData(organizationsQuery),
})

function Index() {
  const { isAuthenticated } = useAuth0()
  const { data } = useSuspenseQuery(organizationsQuery)

  if (data?.length) {
    // Redirect to first organization overview
    return <Navigate to="/organization/$organizationId/overview" params={{ organizationId: data[0].id }} />
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
