import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import {
  type BudgetPolicy,
  clearProjectBudget,
  setDefaultBudgetPolicy,
  setProjectBudgets,
} from '@qovery/domains/cost-management/data-access'

/**
 * Writes budget settings from the Cost control tab.
 *
 * Every write invalidates the whole prototype cost namespace: a budget change
 * moves the organization totals, the project rows and the project page at once,
 * and tracking those keys separately would only be a way to get them out of sync.
 */
export function useBudgetSettings() {
  const queryClient = useQueryClient()

  const invalidate = useCallback(() => queryClient.invalidateQueries({ queryKey: ['prototype-cost'] }), [queryClient])

  const updateDefaultPolicy = useCallback(
    (changes: Partial<BudgetPolicy>) => {
      setDefaultBudgetPolicy(changes)
      invalidate()
    },
    [invalidate]
  )

  const updateProjectBudgets = useCallback(
    (projectIds: string[], monthlyLimit: number) => {
      setProjectBudgets(projectIds, monthlyLimit)
      invalidate()
    },
    [invalidate]
  )

  const resetToDefault = useCallback(
    (projectIds: string[]) => {
      projectIds.forEach(clearProjectBudget)
      invalidate()
    },
    [invalidate]
  )

  return { updateDefaultPolicy, updateProjectBudgets, resetToDefault }
}

export default useBudgetSettings
