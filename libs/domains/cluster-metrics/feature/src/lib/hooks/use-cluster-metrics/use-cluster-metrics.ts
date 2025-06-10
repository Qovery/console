import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterMetricsWSProps {
  organizationId: string
  clusterId: string
}

// XXX: This hook requires initializing 'use-cluster-metrics-socket'.
// This enables WebSocket integration with react-query
export function useClusterMetrics({ organizationId, clusterId }: UseClusterMetricsWSProps) {
  return useQuery({
    ...queries.clusters.metrics({ organizationId, clusterId }),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  })
}

export default useClusterMetrics
