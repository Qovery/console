import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseClusterOperatorBootstrapProps {
  organizationId: string
  clusterId: string
  enabled?: boolean
}

// The bootstrap values carry the cluster credential: never keep them in the cache once unused.
export function useClusterOperatorBootstrap({
  organizationId,
  clusterId,
  enabled = true,
}: UseClusterOperatorBootstrapProps) {
  return useQuery({
    ...queries.clusters.operatorBootstrap({ organizationId, clusterId }),
    enabled: enabled && Boolean(organizationId) && Boolean(clusterId),
    cacheTime: 0,
    refetchOnWindowFocus: false,
  })
}

export default useClusterOperatorBootstrap
