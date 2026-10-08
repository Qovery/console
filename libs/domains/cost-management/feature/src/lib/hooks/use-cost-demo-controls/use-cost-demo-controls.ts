import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { resetProjectCost, setBudgetConsumption } from '@qovery/domains/cost-management/data-access'
import { costQueryKeys } from '../../utils/cost-query-keys'

/**
 * PROTOTYPE-ONLY. Puts the project at an arbitrary point in its budget so a
 * scenario can be replayed live without reloading the tab.
 */
export function useCostDemoControls(projectId: string) {
  const queryClient = useQueryClient()

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: costQueryKeys.projectCost(projectId) }),
    [queryClient, projectId]
  )

  const setConsumption = useCallback(
    (percent: number) => {
      setBudgetConsumption(projectId, percent)
      invalidate()
    },
    [projectId, invalidate]
  )

  const reset = useCallback(() => {
    resetProjectCost(projectId)
    invalidate()
  }, [projectId, invalidate])

  return { setConsumption, reset }
}

export default useCostDemoControls
