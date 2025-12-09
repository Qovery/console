import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterLogsProps {
  organizationId: string
  clusterId: string
  refetchInterval?: number
  refetchIntervalInBackground?: boolean
}

export function useClusterLogs({
  organizationId,
  clusterId,
  refetchInterval,
  refetchIntervalInBackground,
}: UseClusterLogsProps) {
  return useQuery({
    ...queries.clusters.logs({ organizationId, clusterId }),
    refetchInterval,
    refetchIntervalInBackground,
  })
}

export default useClusterLogs
