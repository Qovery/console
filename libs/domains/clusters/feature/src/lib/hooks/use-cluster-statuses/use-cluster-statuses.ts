import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterStatusesProps {
  organizationId: string
  refetchInterval?: number
  enabled?: boolean
  suspense?: boolean
}

export function useClusterStatuses({
  organizationId,
  refetchInterval,
  enabled,
  suspense = false,
}: UseClusterStatusesProps) {
  return useQuery({
    ...queries.clusters.listStatuses({ organizationId }),
    refetchInterval,
    enabled,
    suspense,
  })
}

export default useClusterStatuses
