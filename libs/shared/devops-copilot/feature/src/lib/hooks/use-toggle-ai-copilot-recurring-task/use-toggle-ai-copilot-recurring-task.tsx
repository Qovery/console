import { useMutation, useQueryClient } from '@tanstack/react-query'
import { devopsCopilot, mutations } from '@qovery/shared/devops-copilot/data-access'
import { toast } from '@qovery/shared/ui'

export interface UseToggleAICopilotRecurringTaskProps {
  organizationId: string
}

export function useToggleAICopilotRecurringTask({ organizationId }: UseToggleAICopilotRecurringTaskProps) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId }: { taskId: string }) =>
      mutations.toggleRecurringTask({
        organizationId,
        taskId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: devopsCopilot.recurringTasks({ organizationId }).queryKey,
      })
      toast('success', 'Task status updated successfully')
    },
    onError: () => {
      toast('error', 'Failed to update task status', 'Please try again later')
    },
  })
}

export default useToggleAICopilotRecurringTask
