import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/infrastructure/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId } = useParams({ strict: false })

  if (!organizationId) {
    return null
  }

  return (
    <Navigate to="/organization/$organizationId/infrastructure/settings/general" params={{ organizationId }} replace />
  )
}
