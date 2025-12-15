import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/organization/$orgId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { orgId } = useParams({ strict: false })

  if (!orgId) {
    return null
  }

  // Redirect to overview
  return <Navigate to="/organization/$orgId/overview" params={{ orgId }} />
}
