import { type Organization } from 'qovery-typescript-axios'
import { useAuth } from '@qovery/shared/auth'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { useUserAccount, useUserRole } from '@qovery/shared/iam/feature'
import { Button, Callout, Icon, LoaderSpinner, Section } from '@qovery/shared/ui'
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

  const { roles } = useUserRole()
  const canManage = roles.some((role) => role.includes(`organization:${organization.id}:admin`))

  const { data: userAccount } = useUserAccount()
  const { user: authUser } = useAuth()
  const userEmail = userAccount?.communication_email ?? authUser?.email

  const {
    data: configData,
    isLoading: isLoadingConfig,
    isError: isConfigError,
    refetch,
  } = useAICopilotConfig({
    organizationId: organization.id,
  })

  const { data: recurringTasksData, isLoading: isLoadingTasks } = useAICopilotRecurringTasks({
    organizationId: organization.id,
  })

  const tasks = recurringTasksData?.tasks || []
  const orgConfig = configData?.org_config
  const isEnabled = orgConfig?.enabled ?? false
  const currentMode = orgConfig?.read_only !== false ? 'read-only' : 'read-write'
  const currentTokenMode = orgConfig?.token_mode ?? 'jwt'

  const toggleTaskMutation = useToggleAICopilotRecurringTask({ organizationId: organization.id })
  const deleteTaskMutation = useDeleteAICopilotRecurringTask({ organizationId: organization.id })
  const updateConfigMutation = useUpdateAICopilotConfig({
    organizationId: organization.id,
    instructions: orgConfig?.instructions,
  })

  const handleToggleCopilot = (enabled: boolean) => {
    if (canManage)
      updateConfigMutation.mutate({ enabled, readOnly: enabled ? true : orgConfig?.read_only ?? true, userEmail })
  }

  return (
    <div className="w-full justify-between">
      <Section className="px-8 pb-8 pt-6">
        <SettingsHeading
          title="Copilot configuration"
          description="Manage Copilot access for your organization."
          showNeedHelp={false}
        />
        <div className="max-w-content-with-navigation-left">
          <Callout.Root color="sky" className="mb-4">
            <Callout.Icon>
              <Icon iconName="flask" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextHeading>New Feature</Callout.TextHeading>
              <Callout.TextDescription>
                Copilot is a new feature. This is an experimental feature and functionality may change. Billing terms
                are not final and will be communicated before any charges apply.
              </Callout.TextDescription>
            </Callout.Text>
          </Callout.Root>
          {isLoadingConfig ? (
            <div role="status" className="flex items-center gap-2 p-4 text-sm text-neutral-subtle">
              <LoaderSpinner className="w-5" /> Loading Copilot configuration…
            </div>
          ) : isConfigError || !orgConfig ? (
            <Callout.Root color="red">
              <Callout.Text>
                <Callout.TextHeading>Unable to load Copilot configuration</Callout.TextHeading>
                <Callout.TextDescription>Try again to check whether Copilot is active.</Callout.TextDescription>
              </Callout.Text>
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </Callout.Root>
          ) : !isEnabled ? (
            <SectionAICopilotOptIn
              organization={organization}
              isUpdating={updateConfigMutation.isLoading}
              canManage={canManage}
              onEnable={() => handleToggleCopilot(true)}
            />
          ) : (
            <div className="flex flex-col gap-8">
              <SectionAICopilotConfiguration
                organization={organization}
                isLoading={isLoadingConfig || !orgConfig}
                isUpdating={updateConfigMutation.isLoading}
                canManage={canManage}
                currentMode={currentMode}
                currentTokenMode={currentTokenMode}
                onModeChange={(mode) =>
                  updateConfigMutation.mutate({ enabled: orgConfig.enabled, readOnly: mode === 'read-only' })
                }
                onTokenModeChange={(tokenMode) =>
                  updateConfigMutation.mutate({
                    enabled: orgConfig.enabled,
                    readOnly: orgConfig?.read_only ?? true,
                    tokenMode,
                  })
                }
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
        </div>
      </Section>
    </div>
  )
}

export default AICopilotSettings
