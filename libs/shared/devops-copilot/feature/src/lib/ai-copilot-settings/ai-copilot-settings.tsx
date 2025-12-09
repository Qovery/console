import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { type Organization } from 'qovery-typescript-axios'
import { useAICopilotConfig } from '../hooks/use-ai-copilot-config/use-ai-copilot-config'
import { useAICopilotRecurringTasks } from '../hooks/use-ai-copilot-recurring-tasks/use-ai-copilot-recurring-tasks'
import { useDeleteAICopilotRecurringTask } from '../hooks/use-delete-ai-copilot-recurring-task/use-delete-ai-copilot-recurring-task'
import { useToggleAICopilotRecurringTask } from '../hooks/use-toggle-ai-copilot-recurring-task/use-toggle-ai-copilot-recurring-task'
import { useUpdateAICopilotConfig } from '../hooks/use-update-ai-copilot-config/use-update-ai-copilot-config'
import SectionAICopilotConfiguration from './section-ai-copilot-configuration/section-ai-copilot-configuration'
import SectionAICopilotOptIn from './section-ai-copilot-opt-in/section-ai-copilot-opt-in'
import SectionScheduledTasks from './section-scheduled-tasks/section-scheduled-tasks'

export interface AICopilotSettingsProps {
  organization: Organization
}

export function AICopilotSettings(props: AICopilotSettingsProps) {
  const { organization } = props
  const isDevopsCopilotPanelFeatureFlag = useFeatureFlagVariantKey('devops-copilot-config-panel')

  const { data: configData, isLoading: isLoadingConfig } = useAICopilotConfig({
    organizationId: organization.id,
  })

  const { data: recurringTasksData, isLoading: isLoadingTasks } = useAICopilotRecurringTasks({
    organizationId: organization.id,
  })

  const tasks = recurringTasksData?.tasks || []
  const orgConfig = configData?.org_config
  const isEnabled = orgConfig?.enabled ?? false
  const currentMode = orgConfig?.read_only ? 'read-only' : 'read-write'

  const toggleTaskMutation = useToggleAICopilotRecurringTask({ organizationId: organization.id })
  const deleteTaskMutation = useDeleteAICopilotRecurringTask({ organizationId: organization.id })
  const updateConfigMutation = useUpdateAICopilotConfig({
    organizationId: organization.id,
    instructions: orgConfig?.instructions,
  })

  const handleToggleCopilot = (enabled: boolean) => {
    updateConfigMutation.mutate({ enabled, readOnly: true })
  }

  if (!isDevopsCopilotPanelFeatureFlag) {
    return null
  }

  return (
    <div className="w-full justify-between">
      <div className="max-w-content-with-navigation-left p-8">
        {!isEnabled && !isLoadingConfig ? (
          <SectionAICopilotOptIn
            organization={organization}
            isLoading={isLoadingConfig}
            onEnable={() => handleToggleCopilot(true)}
          />
        ) : (
          <>
            <SectionAICopilotConfiguration
              organization={organization}
              isLoading={isLoadingConfig}
              isUpdating={updateConfigMutation.isLoading}
              currentMode={currentMode}
              onModeChange={(mode) => updateConfigMutation.mutate({ enabled: true, readOnly: mode === 'read-only' })}
              onDisable={() => handleToggleCopilot(false)}
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

export default AICopilotSettings
