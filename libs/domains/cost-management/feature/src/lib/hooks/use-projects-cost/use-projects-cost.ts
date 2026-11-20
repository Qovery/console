import { useQuery } from '@tanstack/react-query'
import { getProjectCost } from '@qovery/domains/cost-management/data-access'
import { costQueryKeys } from '../../utils/cost-query-keys'

export interface UseProjectsCostProps {
  projectIds: string[]
  suspense?: boolean
}

/** Cost for every project of an organization, keyed by project id. */
export function useProjectsCost({ projectIds, suspense = false }: UseProjectsCostProps) {
  return useQuery({
    queryKey: costQueryKeys.projectsCost(projectIds),
    queryFn: async () => Object.fromEntries(projectIds.map((projectId) => [projectId, getProjectCost(projectId)])),
    suspense,
    staleTime: 0,
  })
}

export default useProjectsCost
