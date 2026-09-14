import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterLogsProps {
  organizationId: string
  clusterId: string
  refetchInterval?: number
  enabled?: boolean
}

export function useClusterLogs({ organizationId, clusterId, refetchInterval, enabled = true }: UseClusterLogsProps) {
  return useQuery({
    ...queries.clusters.logs({ organizationId, clusterId }),
    refetchInterval,
    enabled,
  })
}

export default useClusterLogs
