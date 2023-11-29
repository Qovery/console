import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterStatusesProps {
  organizationId: string
  refetchInterval?: number
}

export function useClusterStatuses({ organizationId, refetchInterval }: UseClusterStatusesProps) {
  return useQuery({
    ...queries.clusters.listStatuses({ organizationId }),
    refetchInterval,
  })
}

export default useClusterStatuses
