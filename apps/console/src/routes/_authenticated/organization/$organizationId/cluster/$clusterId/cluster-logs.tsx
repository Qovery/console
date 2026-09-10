import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'

// Legacy route kept as a redirect to preserve old bookmarks/deep links
export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/cluster-logs')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, clusterId } = useParams({ strict: false })

  if (!organizationId || !clusterId) {
    return null
  }

  return (
    <Navigate
      to="/organization/$organizationId/cluster/$clusterId/deployments"
      params={{ organizationId, clusterId }}
      replace
    />
  )
}
