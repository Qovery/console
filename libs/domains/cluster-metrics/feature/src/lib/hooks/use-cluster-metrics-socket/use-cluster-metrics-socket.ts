import { useQueryClient } from '@tanstack/react-query'
import { type ClusterMetricsDto } from 'qovery-ws-typescript-axios'
import { useEffect } from 'react'
import {
  scheduleClusterStreamExpiry,
  setClusterStreamData,
  subscribeToClusterStream,
} from '@qovery/domains/clusters/feature'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { queries, useReactQueryWsSubscription } from '@qovery/state/util-queries'

interface UseClusterMetricsSocketProps {
  organizationId: string
  clusterId: string
}

export function useClusterMetricsSocket({ organizationId, clusterId }: UseClusterMetricsSocketProps) {
  const queryClient = useQueryClient()
  useEffect(
    () => subscribeToClusterStream(queryClient, queries.clusters.metrics({ organizationId, clusterId }).queryKey),
    [queryClient, organizationId, clusterId]
  )
  const key = queries.clusters.metrics({ organizationId, clusterId }).queryKey

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/cluster/metrics',
    urlSearchParams: { organization: organizationId, cluster: clusterId },
    shouldReconnect: true,
    maxReconnectDelay: 10_000,
    onMessage(client, message: ClusterMetricsDto) {
      if (!message || typeof message !== 'object') {
        scheduleClusterStreamExpiry(client, key)
        return
      }
      // Filter out Fargate nodes (nodes without instance_type).
      setClusterStreamData(client, key, {
        ...message,
        nodes: message.nodes?.filter((node) => node.instance_type),
      })
    },
    onDisconnect: () => scheduleClusterStreamExpiry(queryClient, key),
  })
}

export default useClusterMetricsSocket
