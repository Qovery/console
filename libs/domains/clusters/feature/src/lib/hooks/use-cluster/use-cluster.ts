import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterProps {
  organizationId: string
  clusterId: string
}

export function useCluster({ organizationId, clusterId }: UseClusterProps) {
  return useQuery({
    ...queries.clusters.list({ organizationId }),
    select(clusters) {
      return clusters?.find(({ id }) => clusterId === id)
    },
  })
}

export default useCluster
