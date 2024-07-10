import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterStatusesProps {
  organizationId: string
  refetchInterval?: number
  enabled?: boolean
}

export function useClusterStatuses({ organizationId, refetchInterval, enabled }: UseClusterStatusesProps) {
  return useQuery({
    ...queries.clusters.listStatuses({ organizationId }),
    refetchInterval,
    enabled,
  })
}

export default useClusterStatuses
