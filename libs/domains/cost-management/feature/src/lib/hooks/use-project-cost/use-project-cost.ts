import { useQuery } from '@tanstack/react-query'
import { getProjectCost } from '@qovery/domains/cost-management/data-access'
import { costQueryKeys } from '../../utils/cost-query-keys'

export interface UseProjectCostProps {
  projectId: string
  suspense?: boolean
}

export function useProjectCost({ projectId, suspense = false }: UseProjectCostProps) {
  return useQuery({
    queryKey: costQueryKeys.projectCost(projectId),
    queryFn: async () => getProjectCost(projectId),
    suspense,
    // Cost data is read from memory, so nothing is gained by caching it and the
    // budget bar has to reflect an accepted change immediately.
    staleTime: 0,
  })
}

export default useProjectCost
