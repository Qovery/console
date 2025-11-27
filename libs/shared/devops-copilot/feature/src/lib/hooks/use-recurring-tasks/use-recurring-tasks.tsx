import { useQuery } from '@tanstack/react-query'
import { devopsCopilot } from '@qovery/shared/devops-copilot/data-access'

export interface UseRecurringTasksProps {
  organizationId: string
}

export function useRecurringTasks({ organizationId }: UseRecurringTasksProps) {
  return useQuery({
    ...devopsCopilot.recurringTasks({ organizationId }),
    enabled: !!organizationId,
  })
}

export default useRecurringTasks
