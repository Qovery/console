import { Navigate, Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import { z } from 'zod'
import { useCluster } from '@qovery/domains/clusters/feature'
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

  if (isClusterLoading) {
    return (
      <div className="flex min-h-page-container items-center justify-center">
        <LoaderSpinner />
      </div>
    )
  }

  if (!cluster?.is_catalog_managed && organizationId && clusterId) {
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
