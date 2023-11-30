import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterStatusProps {
  organizationId: string
  clusterId: string
  refetchInterval?: number
}

export function useClusterStatus({ organizationId, clusterId, refetchInterval }: UseClusterStatusProps) {
  return useQuery({
    ...queries.clusters.status({ organizationId, clusterId }),
    refetchInterval,
  })
}

export default useClusterStatus
