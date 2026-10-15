import { useQueryClient } from '@tanstack/react-query'
import { type ClusterStatusDto } from 'qovery-ws-typescript-axios'
import { useEffect } from 'react'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { queries, useReactQueryWsSubscription } from '@qovery/state/util-queries'
import {
  scheduleClusterStreamExpiry,
  setClusterStreamData,
  subscribeToClusterStream,
} from '../../utils/cluster-stream-retention'

interface UseClusterRunningStatusSocketProps {
  organizationId: string
  clusterId: string
}

export function useClusterRunningStatusSocket({ organizationId, clusterId }: UseClusterRunningStatusSocketProps) {
  const queryClient = useQueryClient()
  useEffect(
    () => subscribeToClusterStream(queryClient, queries.clusters.runningStatus({ organizationId, clusterId }).queryKey),
    [queryClient, organizationId, clusterId]
  )
  const key = queries.clusters.runningStatus({ organizationId, clusterId }).queryKey

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/cluster/status',
    urlSearchParams: { organization: organizationId, cluster: clusterId },
    shouldReconnect: true,
    maxReconnectDelay: 10_000,
    onMessage(client, message: ClusterStatusDto) {
      if (message?.computed_status) setClusterStreamData(client, key, message)
      else scheduleClusterStreamExpiry(client, key)
    },
    onDisconnect: () => scheduleClusterStreamExpiry(queryClient, key),
  })
}

export default useClusterRunningStatusSocket
