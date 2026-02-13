import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId } = useParams({ strict: false })

  if (!organizationId) {
    return null
  }

  // Redirect to overview
  return <Navigate to="/organization/$organizationId/settings" params={{ organizationId }} />
}
