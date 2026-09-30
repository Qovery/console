import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseClusterOperatorStatusProps {
  organizationId: string
  clusterId: string
  enabled?: boolean
  // Poll interval in milliseconds, disabled when unset.
  refetchInterval?: number
}

export function useClusterOperatorStatus({
  organizationId,
  clusterId,
  enabled = true,
  refetchInterval,
}: UseClusterOperatorStatusProps) {
  return useQuery({
    ...queries.clusters.operatorStatus({ organizationId, clusterId }),
    enabled: enabled && Boolean(organizationId) && Boolean(clusterId),
    refetchInterval,
  })
}

export default useClusterOperatorStatus
