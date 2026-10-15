import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterMetricsWSProps {
  organizationId: string
  clusterId: string
}

// The matching metrics socket owns updates and disconnect expiry.
export function useRetainedClusterMetrics({ organizationId, clusterId }: UseClusterMetricsWSProps) {
  return useQuery({
    ...queries.clusters.metrics({ organizationId, clusterId }),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  })
}

export default useRetainedClusterMetrics
