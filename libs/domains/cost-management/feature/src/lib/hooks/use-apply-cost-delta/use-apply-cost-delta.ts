import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { applyMonthlyDelta } from '@qovery/domains/cost-management/data-access'
import { costQueryKeys } from '../../utils/cost-query-keys'

/**
 * Records the monthly cost of an operation the user went ahead with, so the
 * project's budget reflects it right away.
 */
export function useApplyCostDelta() {
  const queryClient = useQueryClient()

  return useCallback(
    (projectId: string, monthlyDelta: number) => {
      applyMonthlyDelta(projectId, monthlyDelta)
      queryClient.invalidateQueries({ queryKey: costQueryKeys.projectCost(projectId) })
    },
    [queryClient]
  )
}

export default useApplyCostDelta
