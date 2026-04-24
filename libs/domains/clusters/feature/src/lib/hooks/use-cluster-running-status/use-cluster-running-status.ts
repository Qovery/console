import { useQueries, useQuery } from '@tanstack/react-query'
import type { Cluster } from 'qovery-typescript-axios'
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

// XXX: This hook requires initializing 'use-cluster-status-socket'.
// This enables WebSocket integration with react-query
export function useClusterRunningStatus({ organizationId, clusterId }: UseClusterStatusWSProps) {
  return useQuery({
    ...queries.clusters.runningStatus({ organizationId, clusterId }),
    ...CLUSTER_RUNNING_STATUS_QUERY_OPTIONS,
  })
}

export function useClusterRunningStatuses({ clusters }: { clusters: Cluster[] }) {
  return useQueries({
    queries: clusters.map((cluster) => ({
      ...queries.clusters.runningStatus({
        organizationId: cluster.organization.id,
        clusterId: cluster.id,
      }),
      ...CLUSTER_RUNNING_STATUS_QUERY_OPTIONS,
    })),
  })
}

export default useClusterRunningStatus
