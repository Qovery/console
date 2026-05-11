import { useQuery } from '@tanstack/react-query'
import { Outlet, createFileRoute, useMatches } from '@tanstack/react-router'
import { ClusterStateEnum as ClusterState, type ClusterStateEnum } from 'qovery-typescript-axios'
import { Suspense, useMemo } from 'react'
import { memo } from 'react'
import { ClusterDeploymentProgressCard, useClusterStatuses, useClusters } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { LoaderSpinner } from '@qovery/shared/ui'
import { StatusWebSocketListener } from '@qovery/shared/util-web-sockets'
import { queries } from '@qovery/state/util-queries'
import { type FileRouteTypes } from '../../../../routeTree.gen'

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

const hiddenProgressCardRouteIds: FileRouteTypes['id'][] = [
  '/_authenticated/organization/$organizationId/cluster/$clusterId/cluster-logs',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/deployment/$deploymentId/pre-check-logs',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/service-logs',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments/logs/$executionId',
  '/_authenticated/organization/$organizationId/cluster/new',
  '/_authenticated/organization/$organizationId/cluster/create/$slug',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/$slug',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/cron-job',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/database',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/helm',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job',
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/terraform',
]

function RouteComponent() {
  const matches = useMatches()
  const mergedParams = useMemo(() => {
    return matches.reduce<Record<string, string | undefined>>((acc, match) => {
      return { ...acc, ...(match.params as Record<string, string | undefined>) }
    }, {})
  }, [matches])

  const organizationId = mergedParams.organizationId ?? ''
  const projectId = mergedParams.projectId ?? ''
  const environmentId = mergedParams.environmentId ?? ''
  const versionId = mergedParams.versionId ?? ''

  const { data: clusters } = useClusters({ organizationId })
  const { data: clusterStatuses } = useClusterStatuses({ organizationId, enabled: !!organizationId })
  const { data: environment } = useEnvironment({ environmentId })
  const { data: projectEnvironments } = useQuery({
    ...queries.environments.list({ projectId }),
    enabled: Boolean(organizationId) && Boolean(projectId) && !environmentId,
  })

  const clustersForStatusWebSockets = useMemo(() => {
    if (environmentId) {
      if (environment) {
        return [{ id: environment.cluster_id }]
      }
      return []
    }
    if (projectId) {
      if (!projectEnvironments?.length) {
        return []
      }
      const uniqueClusterIds = [
        ...new Set(projectEnvironments.map((env) => env.cluster_id).filter((clusterId) => Boolean(clusterId))),
      ]
      return uniqueClusterIds.map((id) => ({ id }))
    }
    return clusters ?? []
  }, [environmentId, environment, clusters, projectId, projectEnvironments])

  const deployingClusters = useMemo(() => {
    if (!clusters || !clusterStatuses) return []
    return clusters.filter((cluster) => {
      const status = clusterStatuses.find(({ cluster_id }) => cluster_id === cluster.id)?.status
      return isDeployingStatus(status)
    })
  }, [clusters, clusterStatuses])

  const shouldHideProgressCard = useMemo(
    () =>
      matches.some((match) =>
        hiddenProgressCardRouteIds.some(
          (routeId) => match.routeId === routeId || match.routeId?.startsWith(routeId + '/')
        )
      ),
    [matches]
  )

  return (
    <>
      <Suspense fallback={<Loader />}>
        <Outlet />
      </Suspense>

      {
        /**
         * WebSocket API requires a clusterId. Scope listeners: single cluster on an environment page,
         * project's environment clusters on project routes, otherwise every cluster in the organization.
         */
        clustersForStatusWebSockets.map(
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
        )
      }
      {!shouldHideProgressCard && deployingClusters && deployingClusters.length > 0 && (
        <ClusterDeploymentProgressCard organizationId={organizationId} clusters={deployingClusters} />
      )}
    </>
  )
}
