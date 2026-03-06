import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { type Organization } from 'qovery-typescript-axios'
import { useAuth } from '@qovery/shared/auth'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { useUserAccount } from '@qovery/shared/iam/feature'
import { Callout, Icon, Section } from '@qovery/shared/ui'
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
  const isDevopsCopilotPanelFeatureFlag = useFeatureFlagVariantKey('devops-copilot')

  const { data: userAccount } = useUserAccount()
  const { user: authUser } = useAuth()
  const userEmail = userAccount?.communication_email ?? authUser?.email

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
    updateConfigMutation.mutate({ enabled, readOnly: true, userEmail })
  }

  if (!isDevopsCopilotPanelFeatureFlag) {
    return null
  }

  return (
    <div className="w-full justify-between">
      <div className="max-w-content-with-navigation-left p-8">
        <Section>
          <SettingsHeading title="AI Copilot Configuration" description="Configure your Copilot" showNeedHelp={false} />
          <Callout.Root color="purple" className="mb-4">
            <Callout.Icon>
              <Icon iconName="flask" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextHeading>Beta Feature</Callout.TextHeading>
              <Callout.TextDescription>
                The AI Copilot is currently in beta. This is an experimental feature and functionality may change.
                Billing terms are not final and will be communicated before any charges apply.
              </Callout.TextDescription>
            </Callout.Text>
          </Callout.Root>
          {!isEnabled && !isLoadingConfig ? (
            <SectionAICopilotOptIn
              organization={organization}
              isLoading={isLoadingConfig}
              onEnable={() => handleToggleCopilot(true)}
            />
          ) : (
            <div className="flex flex-col gap-8">
              <SectionAICopilotConfiguration
                organization={organization}
                isLoading={isLoadingConfig || !orgConfig}
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
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

export default AICopilotSettings
