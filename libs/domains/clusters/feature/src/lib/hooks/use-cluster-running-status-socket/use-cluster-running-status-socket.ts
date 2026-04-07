import { type ClusterStatusDto } from 'qovery-ws-typescript-axios'
import { useCallback } from 'react'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { queries, useReactQueryWsSubscription } from '@qovery/state/util-queries'

interface UseClusterRunningStatusSocketProps {
  organizationId: string
  clusterId: string
}

export function useClusterRunningStatusSocket({ organizationId, clusterId }: UseClusterRunningStatusSocketProps) {
  const onMessage = useCallback(
    (
      queryClient: Parameters<NonNullable<Parameters<typeof useReactQueryWsSubscription>[0]['onMessage']>>[0],
      message: ClusterStatusDto
    ) => {
      queryClient.setQueryData(queries.clusters.runningStatus({ organizationId, clusterId }).queryKey, message)
    },
    [organizationId, clusterId]
  )

  const onClose = useCallback(
    (
      queryClient: Parameters<NonNullable<Parameters<typeof useReactQueryWsSubscription>[0]['onClose']>>[0],
      event: CloseEvent
    ) => {
      // XXX: API returns a string for the reason, which allows us to know if the status is available or not
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
