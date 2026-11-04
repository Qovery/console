import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
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
    retry: (failureCount, error) =>
      isAxiosError(error) && error.response && error.response.status < 500 ? false : failureCount < 3,
  })
}

export default useClusterOperatorBootstrap
