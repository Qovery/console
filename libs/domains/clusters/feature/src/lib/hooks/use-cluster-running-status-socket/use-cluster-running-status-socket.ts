import { type QueryClient } from '@tanstack/react-query'
import { type ClusterStatusDto } from 'qovery-ws-typescript-axios'
import { useCallback } from 'react'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { queries, useReactQueryWsSubscription } from '@qovery/state/util-queries'

interface UseClusterRunningStatusSocketProps {
  organizationId: string
  clusterId: string
}

export function useClusterRunningStatusSocket({ organizationId, clusterId }: UseClusterRunningStatusSocketProps) {
  // Stable callback references so that `useReactQueryWsSubscription` does not
  // tear down and re-open the websocket on every parent re-render.
  const onMessage = useCallback(
    (queryClient: QueryClient, message: ClusterStatusDto) => {
      queryClient.setQueryData(queries.clusters.runningStatus({ organizationId, clusterId }).queryKey, message)
    },
    [organizationId, clusterId]
  )

  const onClose = useCallback(
    (queryClient: QueryClient, event: CloseEvent) => {
      // API returns a string for the reason, which lets us know when the status is unavailable
      const isNotFound = event.reason.includes('NotFound')
      if (isNotFound) {
        queryClient.setQueryData(queries.clusters.runningStatus({ organizationId, clusterId }).queryKey, 'NotFound')
      }
    },
    [organizationId, clusterId]
  )

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/cluster/status',
    urlSearchParams: {
      organization: organizationId,
      cluster: clusterId,
    },
    onMessage,
    onClose,
  })
}

export default useClusterRunningStatusSocket
