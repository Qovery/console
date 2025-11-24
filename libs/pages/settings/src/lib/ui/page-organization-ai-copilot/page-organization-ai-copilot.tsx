import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type Organization } from 'qovery-typescript-axios'
import { useState } from 'react'
import { devopsCopilot, mutations } from '@qovery/shared/devops-copilot/data-access'
import {
  Button,
  Checkbox,
  Heading,
  Icon,
  IconAwesomeEnum,
  InputSelect,
  LoaderSpinner,
  Section,
  ToastEnum,
  toast,
  useModalConfirmation,
} from '@qovery/shared/ui'

export interface PageOrganizationAICopilotProps {
  organization?: Organization
}

interface RecurringTask {
  id: string
  user_id: string
  user_intent: string
  cron_expression: string
  enabled: boolean
  environment: string
  created_at: string
  updated_at: string
  last_run_at?: string
  next_run_at?: string
  error_count: number
  last_error?: string
}

export function PageOrganizationAICopilot(props: PageOrganizationAICopilotProps) {
  const { organization } = props
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false)
  const [selectedMode, setSelectedMode] = useState<'read-only' | 'read-write' | null>(null)
  const queryClient = useQueryClient()
  const { openModalConfirmation } = useModalConfirmation()

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
  const actualMode = orgConfig?.read_only ? 'read-only' : 'read-write'
  const mode = selectedMode ?? actualMode
  const hasUnsavedChanges = selectedMode !== null && selectedMode !== actualMode
  const isLoading = isLoadingConfig || isLoadingTasks

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
        (old: any) => ({
          ...old,
          org_config: {
            ...old?.org_config,
            read_only: readOnly,
          },
        })
      )

      return { previousConfig }
    },
    onSuccess: (_data, variables) => {
      setSelectedMode(null)
      const modeName = variables.readOnly ? 'Read-Only' : 'Read-Write'
      toast(ToastEnum.SUCCESS, `Access mode updated to ${modeName}`)
    },
    onError: (_err, _variables, context) => {
      if (context?.previousConfig) {
        queryClient.setQueryData(
          devopsCopilot.config({ organizationId: organization?.id ?? '' }).queryKey,
          context.previousConfig
        )
      }
      toast(ToastEnum.ERROR, 'Failed to update access mode', 'Please try again later')
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: devopsCopilot.config({ organizationId: organization?.id ?? '' }).queryKey,
      })
    },
  })

  const handleToggleCopilot = () => {
    if (!isEnabled && !hasAcceptedTerms) {
      return
    }
    updateConfigMutation.mutate({ enabled: !isEnabled, readOnly: true })
  }

  const handleModeSelect = (newMode: 'read-write' | 'read-only') => {
    setSelectedMode(newMode)
  }

  const handleSaveMode = () => {
    if (selectedMode) {
      updateConfigMutation.mutate({ enabled: true, readOnly: selectedMode === 'read-only' })
    }
  }

  const handleCancelMode = () => {
    setSelectedMode(null)
  }

  const modeOptions = [
    { label: 'Read-Only', value: 'read-only' },
    { label: 'Read-Write', value: 'read-write' },
  ]

  if (isLoading) {
    return (
      <div className="flex w-full flex-col justify-between">
        <Section className="max-w-content-with-navigation-left p-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <Heading className="text-neutral-400">AI Copilot</Heading>
              <p className="text-xs text-neutral-400">Configure your Copilot</p>
            </div>
            <div className="flex items-center justify-center p-12">
              <LoaderSpinner className="w-8" />
            </div>
          </div>
        </Section>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <Heading className="text-neutral-400">AI Copilot</Heading>
            <p className="text-xs text-neutral-400">Configure your Copilot</p>
          </div>

          {!isEnabled && (
            <div className="space-y-4 rounded border border-brand-200 bg-brand-50 p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-brand-500">
                  <Icon iconName="robot" className="text-white" width="20px" height="20px" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-400">Opt-in to AI Copilot</p>
                    <p className="mt-1 text-xs text-neutral-350">
                      Please review and accept the following terms to enable AI Copilot for your organization.
                    </p>
                  </div>

                  <div className="max-h-80 overflow-y-auto rounded border border-neutral-250 bg-white p-4">
                    <h3 className="mb-3 text-sm font-semibold text-neutral-400">AI Copilot Terms of Service</h3>
                    <div className="space-y-3 text-xs text-neutral-350">
                      <div>
                        <p className="mb-1 font-medium text-neutral-400">1. Data Collection and Usage</p>
                        <p>
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                          labore et dolore magna aliqua. By enabling AI Copilot, you acknowledge and agree that Qovery
                          will collect, process, and analyze your organization's infrastructure configuration data,
                          deployment metadata, application logs, and resource utilization metrics. Ut enim ad minim
                          veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 font-medium text-neutral-400">2. AI Processing and Analysis</p>
                        <p>
                          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                          pariatur. The collected data will be processed by artificial intelligence models to provide
                          intelligent recommendations, automated troubleshooting, infrastructure optimization
                          suggestions, and predictive analytics. Excepteur sint occaecat cupidatat non proident, sunt in
                          culpa qui officia deserunt mollit anim id est laborum.
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 font-medium text-neutral-400">3. Data Security and Privacy</p>
                        <p>
                          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
                          laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto
                          beatae vitae dicta sunt explicabo. All data transmissions are encrypted using
                          industry-standard protocols (TLS 1.3). Nemo enim ipsam voluptatem quia voluptas sit aspernatur
                          aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi
                          nesciunt.
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 font-medium text-neutral-400">4. Data Retention and Deletion</p>
                        <p>
                          Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.
                          Infrastructure data and AI analysis results will be retained for a period of 90 days for
                          operational purposes and performance improvement. Sed quia non numquam eius modi tempora
                          incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Upon disabling AI Copilot or
                          terminating your account, all associated data will be permanently deleted within 30 days.
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 font-medium text-neutral-400">5. Third-Party AI Services</p>
                        <p>
                          Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi
                          ut aliquid ex ea commodi consequatur. AI Copilot may utilize third-party artificial
                          intelligence services and large language models to process and analyze your data. Quis autem
                          vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.
                          These providers are contractually bound to maintain strict confidentiality and data protection
                          standards.
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 font-medium text-neutral-400">6. Access Control and Permissions</p>
                        <p>
                          At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium
                          voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati
                          cupiditate non provident. The access mode you select (Read-Only or Read-Write) determines the
                          level of permissions granted to AI Copilot. Similique sunt in culpa qui officia deserunt
                          mollitia animi, id est laborum et dolorum fuga.
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 font-medium text-neutral-400">7. Limitation of Liability</p>
                        <p>
                          Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis
                          est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.
                          While AI Copilot strives to provide accurate recommendations, you acknowledge that
                          AI-generated suggestions should be reviewed and validated before implementation. Omnis
                          voluptas assumenda est, omnis dolor repellendus. Qovery shall not be liable for any damages
                          resulting from the use or reliance on AI Copilot recommendations.
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 font-medium text-neutral-400">8. Modifications to Terms</p>
                        <p>
                          Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut
                          et voluptates repudiandae sint et molestiae non recusandae. Qovery reserves the right to
                          modify these terms at any time. Itaque earum rerum hic tenetur a sapiente delectus, ut aut
                          reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores
                          repellat. You will be notified of material changes and continued use constitutes acceptance of
                          modified terms.
                        </p>
                      </div>
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3">
                    <Checkbox
                      checked={hasAcceptedTerms}
                      onCheckedChange={(checked) => setHasAcceptedTerms(checked === true)}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <span className="text-sm text-neutral-400">
                      I have read and accept the AI Copilot Terms of Service
                    </span>
                  </label>

                  <Button
                    size="md"
                    color="brand"
                    onClick={handleToggleCopilot}
                    disabled={!hasAcceptedTerms}
                    className="mt-4"
                  >
                    <Icon iconName="circle-check" className="mr-2" />
                    Enable AI Copilot
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isEnabled && (
            <div className="flex items-center gap-4 rounded border border-neutral-250 bg-neutral-100 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-brand-500">
                <Icon iconName="robot" className="text-white" width="20px" height="20px" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-400">AI Copilot for {organization?.name}</p>
                <p className="text-xs text-neutral-350">AI-powered assistance is currently active</p>
              </div>
              <Button size="md" color="neutral" onClick={handleToggleCopilot}>
                <Icon iconName="circle-xmark" className="mr-2" />
                Disable
              </Button>
            </div>
          )}

          {isEnabled && (
            <div className="space-y-4 rounded border border-neutral-250 bg-neutral-100 p-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400">Access Mode</label>
                <p className="text-xs text-neutral-350">
                  Choose the level of access the AI Copilot will have on your organization
                </p>
              </div>

              <InputSelect
                value={mode}
                onChange={(value) => handleModeSelect(value as 'read-write' | 'read-only')}
                options={modeOptions}
                portal
                label="Right access"
                disabled={updateConfigMutation.isLoading}
              />

              {hasUnsavedChanges && (
                <div className="flex items-center gap-3">
                  <Button size="md" color="brand" onClick={handleSaveMode} loading={updateConfigMutation.isLoading}>
                    <Icon iconName="check" className="mr-2" />
                    Save changes
                  </Button>
                  <Button
                    size="md"
                    color="neutral"
                    variant="outline"
                    onClick={handleCancelMode}
                    disabled={updateConfigMutation.isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              <div className="mt-4 space-y-3 rounded bg-neutral-150 p-4">
                <div className="flex items-start gap-2">
                  <Icon name={IconAwesomeEnum.CIRCLE_INFO} className="mt-0.5 text-xs text-brand-500" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-neutral-400">
                      {mode === 'read-only' ? 'Read-Only Mode' : 'Read-Write Mode'}
                    </p>
                    <p className="text-xs text-neutral-350">
                      {mode === 'read-only'
                        ? 'AI Copilot can view your infrastructure configuration but cannot make changes. Perfect for analysis and recommendations.'
                        : 'AI Copilot can view and modify your infrastructure configuration. Use with caution as it has full access to your resources.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isEnabled && tasks.length > 0 && (
            <div className="space-y-4 rounded border border-neutral-250 bg-neutral-100 p-6">
              <div className="space-y-2">
                <Heading className="text-neutral-400">Scheduled Tasks</Heading>
                <p className="text-xs text-neutral-350">Recurring tasks configured for your organization</p>
              </div>

              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 rounded border border-neutral-200 bg-white p-4">
                    <Icon
                      name={task.enabled ? IconAwesomeEnum.CLOCK : IconAwesomeEnum.PAUSE}
                      className={`mt-0.5 text-sm ${task.enabled ? 'text-brand-500' : 'text-neutral-350'}`}
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-neutral-400">{task.user_intent}</p>
                      <div className="flex items-center gap-3 text-xs text-neutral-350">
                        <span>Schedule: {task.cron_expression}</span>
                        {task.last_run_at && <span>Last run: {new Date(task.last_run_at).toLocaleString()}</span>}
                        {task.error_count > 0 && <span className="text-red-500">Errors: {task.error_count}</span>}
                      </div>
                      {task.last_error && <p className="mt-1 text-xs text-red-500">{task.last_error}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        color={task.enabled ? 'neutral' : 'brand'}
                        variant="outline"
                        onClick={() => toggleTaskMutation.mutate({ taskId: task.id })}
                        loading={toggleTaskMutation.isLoading}
                      >
                        <Icon iconName={task.enabled ? 'pause' : 'play'} className="mr-1" />
                        {task.enabled ? 'Pause' : 'Resume'}
                      </Button>
                      <Button
                        size="sm"
                        color="red"
                        variant="outline"
                        onClick={() => {
                          openModalConfirmation({
                            title: 'Delete Task',
                            description: 'Are you sure you want to delete this task? This action cannot be undone.',
                            confirmationMethod: 'action',
                            confirmationAction: 'delete',
                            action: () => deleteTaskMutation.mutate({ taskId: task.id }),
                          })
                        }}
                        loading={deleteTaskMutation.isLoading}
                      >
                        <Icon iconName="trash" className="mr-1" />
                        Delete
                      </Button>
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          task.enabled ? 'bg-brand-50 text-brand-500' : 'bg-neutral-150 text-neutral-350'
                        }`}
                      >
                        {task.enabled ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}

export default PageOrganizationAICopilot
