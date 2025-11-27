import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { type Organization } from 'qovery-typescript-axios'
import { devopsCopilot, mutations } from '@qovery/shared/devops-copilot/data-access'
import { ToastEnum, toast } from '@qovery/shared/ui'
import SectionAICopilotConfiguration from './section-ai-copilot-configuration/section-ai-copilot-configuration'
import SectionAICopilotOptIn from './section-ai-copilot-opt-in/section-ai-copilot-opt-in'
import SectionScheduledTasks, { type RecurringTask } from './section-scheduled-tasks/section-scheduled-tasks'

export interface PageOrganizationAICopilotProps {
  organization?: Organization
}

export function PageOrganizationAICopilot(props: PageOrganizationAICopilotProps) {
  const { organization } = props
  const queryClient = useQueryClient()
  const isFeatureFlagPanel = useFeatureFlagVariantKey('devops-copilot-config-panel')

  const { data: configData, isLoading: isLoadingConfig } = useQuery({
    ...devopsCopilot.config({ organizationId: organization?.id ?? '' }),
    enabled: !!organization?.id,
  })

  const { data: recurringTasksData, isLoading: isLoadingTasks } = useQuery({
    ...devopsCopilot.recurringTasks({ organizationId: organization?.id ?? '' }),
    enabled: !!organization?.id,
  })

  const tasks = (recurringTasksData?.tasks as RecurringTask[]) || []
  const orgConfig = configData?.org_config
  const isEnabled = orgConfig?.enabled ?? false
  const currentMode = orgConfig?.read_only ? 'read-only' : 'read-write'

  const toggleTaskMutation = useMutation({
    mutationFn: ({ taskId }: { taskId: string }) =>
      mutations.toggleRecurringTask({
        organizationId: organization?.id ?? '',
        taskId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: devopsCopilot.recurringTasks({ organizationId: organization?.id ?? '' }).queryKey,
      })
      toast(ToastEnum.SUCCESS, 'Task status updated successfully')
    },
    onError: () => {
      toast(ToastEnum.ERROR, 'Failed to update task status', 'Please try again later')
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: ({ taskId }: { taskId: string }) =>
      mutations.deleteRecurringTask({
        organizationId: organization?.id ?? '',
        taskId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: devopsCopilot.recurringTasks({ organizationId: organization?.id ?? '' }).queryKey,
      })
      toast(ToastEnum.SUCCESS, 'Task deleted successfully')
    },
    onError: () => {
      toast(ToastEnum.ERROR, 'Failed to delete task', 'Please try again later')
    },
  })

  const updateConfigMutation = useMutation({
    mutationFn: ({ enabled, readOnly }: { enabled: boolean; readOnly: boolean }) =>
      mutations.updateOrgConfig({
        organizationId: organization?.id ?? '',
        enabled,
        readOnly,
        instructions: orgConfig?.instructions || '',
      }),
    onMutate: async ({ readOnly }) => {
      await queryClient.cancelQueries({
        queryKey: devopsCopilot.config({ organizationId: organization?.id ?? '' }).queryKey,
      })

      const previousConfig = queryClient.getQueryData(
        devopsCopilot.config({ organizationId: organization?.id ?? '' }).queryKey
      )

      queryClient.setQueryData(
        devopsCopilot.config({ organizationId: organization?.id ?? '' }).queryKey,
        (old: typeof configData) =>
          old
            ? {
                ...old,
                org_config: {
                  ...old?.org_config,
                  read_only: readOnly,
                },
              }
            : old
      )

      return { previousConfig }
    },
    onSuccess: (_data, variables) => {
      const modeName = variables.readOnly ? 'Read-Only' : 'Read-Write'
      if (variables.enabled) {
        toast(ToastEnum.SUCCESS, `AI Copilot enabled with ${modeName} mode`)
      } else {
        toast(ToastEnum.SUCCESS, 'AI Copilot disabled successfully')
      }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousConfig) {
        queryClient.setQueryData(
          devopsCopilot.config({ organizationId: organization?.id ?? '' }).queryKey,
          context.previousConfig
        )
      }
      toast(ToastEnum.ERROR, 'Failed to update AI Copilot configuration', 'Please try again later')
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: devopsCopilot.config({ organizationId: organization?.id ?? '' }).queryKey,
      })
    },
  })

  const handleEnableCopilot = () => {
    updateConfigMutation.mutate({ enabled: true, readOnly: true })
  }

  const handleDisableCopilot = () => {
    updateConfigMutation.mutate({ enabled: false, readOnly: true })
  }

  if (!isFeatureFlagPanel) {
    return null
  }

  return (
    <div className="w-full justify-between">
      <div className="max-w-content-with-navigation-left p-8">
        {!isEnabled && !isLoadingConfig ? (
          <SectionAICopilotOptIn
            organization={organization}
            isLoading={isLoadingConfig}
            onEnable={handleEnableCopilot}
          />
        ) : (
          <>
            <SectionAICopilotConfiguration
              organization={organization}
              isLoading={isLoadingConfig}
              isUpdating={updateConfigMutation.isLoading}
              currentMode={currentMode}
              onModeChange={(mode) => updateConfigMutation.mutate({ enabled: true, readOnly: mode === 'read-only' })}
              onDisable={handleDisableCopilot}
            />

            <SectionScheduledTasks
              tasks={tasks}
              isLoading={isLoadingTasks}
              onToggleTask={(taskId) => toggleTaskMutation.mutate({ taskId })}
              onDeleteTask={(taskId) => deleteTaskMutation.mutate({ taskId })}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default PageOrganizationAICopilot
