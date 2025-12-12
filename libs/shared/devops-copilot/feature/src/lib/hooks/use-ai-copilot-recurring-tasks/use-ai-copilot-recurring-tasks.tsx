import { useQuery } from '@tanstack/react-query'
import { devopsCopilot } from '@qovery/shared/devops-copilot/data-access'

export interface UseAICopilotRecurringTasksProps {
  organizationId: string
}

export function useAICopilotRecurringTasks({ organizationId }: UseAICopilotRecurringTasksProps) {
  return useQuery({
    ...devopsCopilot.recurringTasks({ organizationId }),
  })
}

export default useAICopilotRecurringTasks
