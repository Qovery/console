import { Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import { ClusterStateEnum as ClusterState, type ClusterStateEnum } from 'qovery-typescript-axios'
import { Suspense, useMemo } from 'react'
import { memo } from 'react'
import { ClusterDeploymentProgressCard, useClusterStatuses, useClusters } from '@qovery/domains/clusters/feature'
import { LoaderSpinner } from '@qovery/shared/ui'
import { StatusWebSocketListener } from '@qovery/shared/util-web-sockets'
import { queries } from '@qovery/state/util-queries'

export const Route = createFileRoute('/_authenticated/organization/$organizationId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const { organizationId } = params
    // Preload data (organization, clusters and projects) without waiting for the queries to complete
    context.queryClient.prefetchQuery({
      ...queries.organizations.details({ organizationId }),
    })
    context.queryClient.prefetchQuery({
      ...queries.clusters.list({ organizationId }),
    })
    context.queryClient.prefetchQuery({
      ...queries.projects.list({ organizationId }),
    })
  },
})

const Loader = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoaderSpinner />
    </div>
  )
}

const StatusWebSocketListenerMemo = memo(StatusWebSocketListener)

const isDeployingStatus = (status?: ClusterStateEnum): boolean =>
  status === ClusterState.DEPLOYMENT_QUEUED || status === ClusterState.DEPLOYING

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '', versionId = '' } = useParams({ strict: false })
  const { data: clusters } = useClusters({ organizationId })
  const { data: clusterStatuses } = useClusterStatuses({ organizationId, enabled: !!organizationId })

  const deployingClusters = useMemo(() => {
    if (!clusters || !clusterStatuses) return []
    return clusters.filter((cluster) => {
      const status = clusterStatuses.find(({ cluster_id }) => cluster_id === cluster.id)?.status
      return isDeployingStatus(status)
    })
  }, [clusters, clusterStatuses])

  return (
    <>
      <Suspense fallback={<Loader />}>
        <Outlet />
      </Suspense>

      {/**
       * Here we are limited by the websocket API which requires a clusterId
       * We need to instantiate one hook per clusterId to get the complete environment statuses of the page
       */
      clusters?.map(
        ({ id }) =>
          organizationId && (
            <StatusWebSocketListenerMemo
              key={id}
              organizationId={organizationId}
              clusterId={id}
              projectId={projectId}
              environmentId={environmentId}
              versionId={versionId}
            />
          )
      )}
      {deployingClusters && deployingClusters.length > 0 && (
        <ClusterDeploymentProgressCard organizationId={organizationId} clusters={deployingClusters} />
      )}
    </>
  )
}
