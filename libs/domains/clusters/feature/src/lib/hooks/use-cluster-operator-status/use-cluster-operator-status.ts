import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export const OPERATOR_STATUS_REFRESH_INTERVAL = 30_000

export interface UseClusterOperatorStatusProps {
  organizationId: string
  clusterId: string
  enabled?: boolean
  // Poll interval in milliseconds, disabled when unset.
  refetchInterval?: number
  // Stop polling once the cluster is known to have no Operator state (404), instead of waiting for it to appear.
  stopPollingWhenMissing?: boolean
  // Stop polling once the Operator has reported a heartbeat: it never goes back to "not installed".
  stopPollingOnceInstalled?: boolean
  staleTime?: number
}

export function useClusterOperatorStatus({
  organizationId,
  clusterId,
  enabled = true,
  refetchInterval,
  stopPollingWhenMissing = false,
  stopPollingOnceInstalled = false,
  staleTime,
}: UseClusterOperatorStatusProps) {
  return useQuery({
    ...queries.clusters.operatorStatus({ organizationId, clusterId }),
    enabled: enabled && Boolean(organizationId) && Boolean(clusterId),
    refetchInterval: refetchInterval
      ? (data) =>
          (stopPollingWhenMissing && data === null) || (stopPollingOnceInstalled && data?.last_heartbeat)
            ? false
            : refetchInterval
      : undefined,
    staleTime,
  })
}

export default useClusterOperatorStatus
