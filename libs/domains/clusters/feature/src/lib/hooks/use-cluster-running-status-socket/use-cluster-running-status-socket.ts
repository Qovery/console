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
    onClose(queryClient, event: CloseEvent) {
      // XXX: API returns a string for the reason, which allows us to know if the status is available or not
      const isNotFound = event.reason.includes('NotFound')
      if (isNotFound) {
        queryClient.setQueryData(queries.clusters.runningStatus({ organizationId, clusterId }).queryKey, 'NotFound')
      }
    },
  })
}

export default useClusterRunningStatusSocket
