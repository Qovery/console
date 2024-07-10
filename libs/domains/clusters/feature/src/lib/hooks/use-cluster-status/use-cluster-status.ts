import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterStatusProps {
  organizationId: string
  clusterId: string
  refetchInterval?: number
  enabled?: boolean
}

export function useClusterStatus({ organizationId, clusterId, enabled, refetchInterval }: UseClusterStatusProps) {
  return useQuery({
    ...queries.clusters.status({ organizationId, clusterId }),
    enabled,
    refetchInterval,
  })
}

export default useClusterStatus
