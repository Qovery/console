import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/$clusterId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, clusterId } = useParams({ strict: false })

  if (!organizationId || !clusterId) {
    return null
  }

  return (
    <Navigate to="/organization/$organizationId/cluster/$clusterId/overview" params={{ organizationId, clusterId }} />
  )
}
