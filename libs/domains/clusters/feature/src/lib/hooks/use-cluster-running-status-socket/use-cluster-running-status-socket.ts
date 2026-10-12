import { type QueryClient, useQueryClient } from '@tanstack/react-query'
import { type ClusterStatusDto } from 'qovery-ws-typescript-axios'
import { useCallback, useEffect, useMemo } from 'react'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { queries, useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { clusterStatusGracePeriod } from './cluster-status-grace-period'

interface UseClusterRunningStatusSocketProps {
  organizationId: string
  clusterId: string
}

export function useClusterRunningStatusSocket({ organizationId, clusterId }: UseClusterRunningStatusSocketProps) {
  const queryClient = useQueryClient()
  const gracePeriod = useMemo(
    () => clusterStatusGracePeriod(queryClient, organizationId, clusterId),
    [queryClient, organizationId, clusterId]
  )
  useEffect(() => gracePeriod.subscribe(), [gracePeriod])

  // Stable callback references so that `useReactQueryWsSubscription` does not
  // tear down and re-open the websocket on every parent re-render.
  const onMessage = useCallback(
    (queryClient: QueryClient, message: ClusterStatusDto) => {
      if (!message?.computed_status) {
        gracePeriod.disconnected()
        return
      }
      queryClient.setQueryData(queries.clusters.runningStatus({ organizationId, clusterId }).queryKey, message)
      gracePeriod.received(message)
    },
    [organizationId, clusterId, gracePeriod]
  )

  const onDisconnect = useCallback(
    (queryClient: QueryClient, event: CloseEvent) => {
      gracePeriod.disconnected()
      // API returns a string for the reason, which lets us know when the status is unavailable
      const isNotFound = event.reason.includes('NotFound')
      if (isNotFound) {
        queryClient.setQueryData(queries.clusters.runningStatus({ organizationId, clusterId }).queryKey, 'NotFound')
      }
    },
    [organizationId, clusterId, gracePeriod]
  )

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/cluster/status',
    urlSearchParams: {
      organization: organizationId,
      cluster: clusterId,
    },
    onMessage,
    onDisconnect,
    shouldReconnect: true,
    maxReconnectDelay: 10_000,
  })
}

export default useClusterRunningStatusSocket
