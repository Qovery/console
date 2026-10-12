import { type QueryClient } from '@tanstack/react-query'
import { type ClusterStatusDto } from 'qovery-ws-typescript-axios'
import { CLUSTER_STATUS_GRACE_PERIOD_MS, CLUSTER_STATUS_INITIAL_TIMEOUT_MS } from '@qovery/domains/clusters/data-access'
import { createQueryGracePeriod, queries } from '@qovery/state/util-queries'

export { CLUSTER_STATUS_GRACE_PERIOD_MS, CLUSTER_STATUS_INITIAL_TIMEOUT_MS } from '@qovery/domains/clusters/data-access'

export function clusterStatusGracePeriod(queryClient: QueryClient, organizationId: string, clusterId: string) {
  return createQueryGracePeriod<ClusterStatusDto | 'NotFound'>(
    queryClient,
    queries.clusters.runningDisplayStatus({ organizationId, clusterId }).queryKey,
    {
      timeoutMs: CLUSTER_STATUS_GRACE_PERIOD_MS,
      initialTimeoutMs: CLUSTER_STATUS_INITIAL_TIMEOUT_MS,
      unavailableValue: 'NotFound',
    }
  )
}
