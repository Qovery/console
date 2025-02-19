import { useQuery } from '@tanstack/react-query'
import { type ClusterStatusDto } from 'qovery-ws-typescript-axios'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { queries, useReactQueryWsSubscription } from '@qovery/state/util-queries'

interface UseClusterRunningStatusSocketProps {
  organizationId: string
  clusterId: string
}

export function useClusterRunningStatusSocket({ organizationId, clusterId }: UseClusterRunningStatusSocketProps) {
  useReactQueryWsSubscription({
    url: QOVERY_WS + '/cluster/status',
    urlSearchParams: {
      organization: organizationId,
      cluster: clusterId,
    },
    onMessage(queryClient, message: ClusterStatusDto) {
      queryClient.setQueryData(queries.clusters.runningStatus({ organizationId, clusterId }).queryKey, message)
    },
  })
}

interface UseClusterStatusWSProps {
  organizationId: string
  clusterId: string
}

// XXX: This hook requires initializing 'use-cluster-status-socket' beforehand.
// This enables WebSocket integration with react-query
export function useClusterRunningStatus({ organizationId, clusterId }: UseClusterStatusWSProps) {
  return useQuery({
    ...queries.clusters.runningStatus({ organizationId, clusterId }),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  })
}
