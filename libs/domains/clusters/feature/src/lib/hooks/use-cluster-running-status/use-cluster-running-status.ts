import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterStatusWSProps {
  organizationId: string
  clusterId: string
}

// XXX: This hook requires initializing 'use-cluster-status-socket'.
// This enables WebSocket integration with react-query
export function useClusterRunningStatus({ organizationId, clusterId }: UseClusterStatusWSProps) {
  return useQuery({
    ...queries.clusters.runningStatus({ organizationId, clusterId }),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  })
}

export default useClusterRunningStatus
