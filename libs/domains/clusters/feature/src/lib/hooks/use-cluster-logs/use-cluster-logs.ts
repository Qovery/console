import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterLogsProps {
  organizationId: string
  clusterId: string
  refetchInterval?: number
}

export function useClusterLogs({ organizationId, clusterId, refetchInterval }: UseClusterLogsProps) {
  return useQuery({
    ...queries.clusters.logs({ organizationId, clusterId }),
    refetchInterval,
  })
}

export default useClusterLogs
