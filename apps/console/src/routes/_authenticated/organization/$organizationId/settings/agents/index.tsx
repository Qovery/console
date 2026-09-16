import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/agents/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId } = useParams({ strict: false })

  if (!organizationId) return null

  return <Navigate to="/organization/$organizationId/settings/agents/tokens" params={{ organizationId }} replace />
}
