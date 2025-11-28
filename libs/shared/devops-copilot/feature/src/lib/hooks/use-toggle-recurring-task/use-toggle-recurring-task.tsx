import { useMutation, useQueryClient } from '@tanstack/react-query'
import { devopsCopilot, mutations } from '@qovery/shared/devops-copilot/data-access'
import { ToastEnum, toast } from '@qovery/shared/ui'

export interface UseToggleRecurringTaskProps {
  organizationId: string
}

export function useToggleRecurringTask({ organizationId }: UseToggleRecurringTaskProps) {
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
      toast(ToastEnum.SUCCESS, 'Task status updated successfully')
    },
    onError: () => {
      toast(ToastEnum.ERROR, 'Failed to update task status', 'Please try again later')
    },
  })
}

export default useToggleRecurringTask
