import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseClusterOperatorStatusProps {
  organizationId: string
  clusterId: string
  enabled?: boolean
  // Poll interval in milliseconds, disabled when unset.
  refetchInterval?: number
  staleTime?: number
}

export function useClusterOperatorStatus({
  organizationId,
  clusterId,
  enabled = true,
  refetchInterval,
  staleTime,
}: UseClusterOperatorStatusProps) {
  return useQuery({
    ...queries.clusters.operatorStatus({ organizationId, clusterId }),
    enabled: enabled && Boolean(organizationId) && Boolean(clusterId),
    refetchInterval,
    staleTime,
  })
}

export default useClusterOperatorStatus
