import { type ClusterMetricsDto } from 'qovery-ws-typescript-axios'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { queries, useReactQueryWsSubscription } from '@qovery/state/util-queries'

interface UseClusterMetricsSocketProps {
  organizationId: string
  clusterId: string
}

export function useClusterMetricsSocket({ organizationId, clusterId }: UseClusterMetricsSocketProps) {
  useReactQueryWsSubscription({
    url: QOVERY_WS + '/cluster/metrics',
    urlSearchParams: {
      organization: organizationId,
      cluster: clusterId,
    },
    onMessage(queryClient, message: ClusterMetricsDto) {
      // XXX: Filter out Fargate nodes (nodes without instance_type)
      const filteredMessage = {
        ...message,
        nodes: message.nodes?.filter((node) => node.instance_type),
      }
      queryClient.setQueryData(queries.clusters.metrics({ organizationId, clusterId }).queryKey, filteredMessage)
    },
    onClose(queryClient, event: CloseEvent) {
      // XXX: API returns a string for the reason, which allows us to know if the status is available or not
      const isNotFound = event.reason.includes('NotFound')
      if (isNotFound) {
        queryClient.setQueryData(queries.clusters.metrics({ organizationId, clusterId }).queryKey, 'NotFound')
      }
    },
  })
}

export default useClusterMetricsSocket
