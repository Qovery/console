import { useMutation, useQueryClient } from '@tanstack/react-query'
import { devopsCopilot, mutations } from '@qovery/shared/devops-copilot/data-access'
import { ToastEnum, toast } from '@qovery/shared/ui'

export interface UseDeleteAICopilotRecurringTaskProps {
  organizationId: string
}

export function useDeleteAICopilotRecurringTask({ organizationId }: UseDeleteAICopilotRecurringTaskProps) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId }: { taskId: string }) =>
      mutations.deleteRecurringTask({
        organizationId,
        taskId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: devopsCopilot.recurringTasks({ organizationId }).queryKey,
      })
      toast(ToastEnum.SUCCESS, 'Task deleted successfully')
    },
    onError: () => {
      toast(ToastEnum.ERROR, 'Failed to delete task', 'Please try again later')
    },
  })
}

export default useDeleteAICopilotRecurringTask
