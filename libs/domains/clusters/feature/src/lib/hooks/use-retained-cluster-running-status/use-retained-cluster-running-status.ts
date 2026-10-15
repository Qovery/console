import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterStatusWSProps {
  organizationId: string
  clusterId: string
}

const CLUSTER_RUNNING_STATUS_QUERY_OPTIONS = {
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  staleTime: Infinity,
} as const

// The matching running-status socket owns updates and disconnect expiry.
// React Query retains the last payload; staleTime only disables HTTP refetching.
export function useRetainedClusterRunningStatus({ organizationId, clusterId }: UseClusterStatusWSProps) {
  return useQuery({
    ...queries.clusters.runningStatus({ organizationId, clusterId }),
    ...CLUSTER_RUNNING_STATUS_QUERY_OPTIONS,
  })
}

export default useRetainedClusterRunningStatus
