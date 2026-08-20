import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/infrastructure/alerts/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId } = useParams({ strict: false })

  if (!organizationId) {
    return null
  }

  return (
    <Navigate to="/organization/$organizationId/infrastructure/alerts/issues" params={{ organizationId }} replace />
  )
}
