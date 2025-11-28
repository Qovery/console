import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { type Organization } from 'qovery-typescript-axios'
import {
  useConfig,
  useRecurringTasks,
  useToggleRecurringTask,
  useDeleteRecurringTask,
  useUpdateOrgConfig,
} from '@qovery/shared/devops-copilot/feature'
import SectionAICopilotConfiguration from './section-ai-copilot-configuration/section-ai-copilot-configuration'
import SectionAICopilotOptIn from './section-ai-copilot-opt-in/section-ai-copilot-opt-in'
import SectionScheduledTasks, { type RecurringTask } from './section-scheduled-tasks/section-scheduled-tasks'

export interface PageOrganizationAICopilotProps {
  organization?: Organization
}

export function PageOrganizationAICopilot(props: PageOrganizationAICopilotProps) {
  const { organization } = props
  const isDevopsCopilotPanelFeatureFlag = useFeatureFlagVariantKey('devops-copilot-config-panel')

  const { data: configData, isLoading: isLoadingConfig } = useConfig({ organizationId: organization?.id ?? '' })

  const { data: recurringTasksData, isLoading: isLoadingTasks } = useRecurringTasks({
    organizationId: organization?.id ?? '',
  })

  const tasks = recurringTasksData?.tasks || []
  const orgConfig = configData?.org_config
  const isEnabled = orgConfig?.enabled ?? false
  const currentMode = orgConfig?.read_only ? 'read-only' : 'read-write'

  const toggleTaskMutation = useToggleRecurringTask({ organizationId: organization?.id ?? '' })
  const deleteTaskMutation = useDeleteRecurringTask({ organizationId: organization?.id ?? '' })
  const updateConfigMutation = useUpdateOrgConfig({
    organizationId: organization?.id ?? '',
    instructions: orgConfig?.instructions,
  })

  const handleEnableCopilot = () => {
    updateConfigMutation.mutate({ enabled: true, readOnly: true })
  }

  const handleDisableCopilot = () => {
    updateConfigMutation.mutate({ enabled: false, readOnly: true })
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
