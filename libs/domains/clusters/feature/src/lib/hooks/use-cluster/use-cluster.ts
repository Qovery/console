import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterProps {
  organizationId?: string
  clusterId?: string
  enabled?: boolean
}

export function useCluster({ organizationId, clusterId, enabled }: UseClusterProps) {
  return useQuery({
    ...queries.clusters.list({ organizationId: organizationId!! }),
    select(clusters) {
      return clusters?.find(({ id }) => clusterId === id)
    },
    enabled: Boolean(organizationId) || Boolean(clusterId) || enabled,
  })
}

export default useCluster
