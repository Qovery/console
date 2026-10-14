import { Navigate, Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import { z } from 'zod'
import { useCluster, useIsOperatorAttached } from '@qovery/domains/clusters/feature'
import { LoaderSpinner } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/profile')({
  component: RouteComponent,
  validateSearch: z.object({ search: z.string().optional() }),
})

function RouteComponent() {
  useDocumentTitle('Cluster - Profile')
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const { data: cluster, isLoading: isClusterLoading } = useCluster({ organizationId, clusterId })
  // Only Engine v2 clusters, attached to the Qovery Operator, have a profile.
  const isOperatorAttached = useIsOperatorAttached(cluster)

  // Redirecting before the flags, the cluster and its Operator status are loaded would turn away users who have access.
  if (isClusterLoading || (cluster && isOperatorAttached === undefined)) {
    return (
      <div className="flex min-h-page-container items-center justify-center">
        <LoaderSpinner />
      </div>
    )
  }

  if (!isOperatorAttached && organizationId && clusterId) {
    return (
      <Navigate
        to="/organization/$organizationId/cluster/$clusterId/overview"
        params={{ organizationId, clusterId }}
        replace
      />
    )
  }

  return <Outlet />
}
