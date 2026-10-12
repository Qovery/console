import { useQueryClient } from '@tanstack/react-query'
import { type ClusterMetricsDto } from 'qovery-ws-typescript-axios'
import { useEffect, useMemo } from 'react'
import { CLUSTER_STATUS_GRACE_PERIOD_MS, CLUSTER_STATUS_INITIAL_TIMEOUT_MS } from '@qovery/domains/clusters/data-access'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { createQueryGracePeriod, queries, useReactQueryWsSubscription } from '@qovery/state/util-queries'

interface UseClusterMetricsSocketProps {
  organizationId: string
  clusterId: string
}

export function useClusterMetricsSocket({ organizationId, clusterId }: UseClusterMetricsSocketProps) {
  const queryClient = useQueryClient()
  const gracePeriod = useMemo(
    () =>
      createQueryGracePeriod<ClusterMetricsDto | null>(
        queryClient,
        queries.clusters.displayMetrics({ organizationId, clusterId }).queryKey,
        {
          timeoutMs: CLUSTER_STATUS_GRACE_PERIOD_MS,
          initialTimeoutMs: CLUSTER_STATUS_INITIAL_TIMEOUT_MS,
          unavailableValue: null,
        }
      ),
    [queryClient, organizationId, clusterId]
  )
  useEffect(() => gracePeriod.subscribe(), [gracePeriod])

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/cluster/metrics',
    urlSearchParams: {
      organization: organizationId,
      cluster: clusterId,
    },
    shouldReconnect: true,
    maxReconnectDelay: 10_000,
    onMessage(queryClient, message: ClusterMetricsDto) {
      if (!message || typeof message !== 'object') {
        gracePeriod.disconnected()
        return
      }
      // XXX: Filter out Fargate nodes (nodes without instance_type)
      const filteredMessage = {
        ...message,
        nodes: message.nodes?.filter((node) => node.instance_type),
      }
      queryClient.setQueryData(queries.clusters.metrics({ organizationId, clusterId }).queryKey, filteredMessage)
      gracePeriod.received(filteredMessage)
    },
    onDisconnect(queryClient, event: CloseEvent) {
      gracePeriod.disconnected()
      // XXX: API returns a string for the reason, which allows us to know if the status is available or not
      const isNotFound = event.reason.includes('NotFound')
      if (isNotFound) {
        queryClient.setQueryData(queries.clusters.metrics({ organizationId, clusterId }).queryKey, 'NotFound')
      }
    },
  })
}

export default useClusterMetricsSocket
