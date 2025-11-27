import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { type Organization } from 'qovery-typescript-axios'
import { useState } from 'react'
import { devopsCopilot, mutations } from '@qovery/shared/devops-copilot/data-access'
import {
  BlockContent,
  Button,
  Callout,
  Checkbox,
  Heading,
  Icon,
  IconAwesomeEnum,
  InputSelect,
  InputToggle,
  LoaderSpinner,
  Section,
  ToastEnum,
  toast,
  useModal,
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
  const { openModal, closeModal } = useModal()
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

  if (!isFeatureFlagPanel) {
    return null
  }

  return (
    <div className="w-full justify-between">
      <div className="max-w-content-with-navigation-left p-8">
        <Section>
          <div className="mb-8 flex justify-between gap-2">
            <div className="space-y-3">
              <Heading>AI Copilot Configuration</Heading>
              <p className="text-xs text-neutral-400">Configure your Copilot</p>
            </div>
          </div>
          {!isEnabled && (
            <BlockContent title="Configuration" classNameContent="p-0">
              {isLoading ? (
                <div className="flex justify-center p-5">
                  <LoaderSpinner className="w-5" />
                </div>
              ) : (
                <div className="p-6">
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
                        <h3 className="mb-3 text-sm font-semibold text-neutral-400">
                          Qovery AI Copilot - Additional Terms of Service
                        </h3>
                        <div className="space-y-4 text-xs text-neutral-350">
                          <div>
                            <p className="mb-2 font-semibold text-neutral-400">1. Introduction</p>
                            <p>
                              These AI Copilot Additional Terms ("AI Terms") supplement and are incorporated into the
                              Qovery Terms of Service. By enabling the AI Copilot feature, you agree to these AI Terms
                              on behalf of your organization.
                            </p>
                            <p className="mt-2">
                              The AI Copilot is an optional feature that leverages Anthropic's Claude AI model (Sonnet)
                              to assist users with the Qovery platform through intelligent documentation retrieval and
                              automated actions (subject to user confirmation).
                            </p>
                          </div>

                          <div>
                            <p className="mb-2 font-semibold text-neutral-400">2. Feature Description</p>
                            <p className="mb-1">The AI Copilot provides:</p>
                            <ul className="ml-4 list-disc space-y-1">
                              <li>Intelligent assistance for using the Qovery service</li>
                              <li>Execution of platform actions based on user instructions (after confirmation)</li>
                              <li>Contextual documentation and guidance retrieval</li>
                              <li>Integration with your Qovery organization's resources and configurations</li>
                            </ul>
                            <p className="mt-2">The AI Copilot operates in two modes:</p>
                            <ul className="ml-4 list-disc space-y-1">
                              <li>
                                <span className="font-medium">Read-Only Mode:</span> The AI Copilot can view your
                                infrastructure configuration, provide recommendations, and answer questions, but cannot
                                make any modifications to your resources
                              </li>
                              <li>
                                <span className="font-medium">Read-Write Mode:</span> The AI Copilot can view and modify
                                your infrastructure configuration after explicit user confirmation for each action
                              </li>
                            </ul>
                          </div>

                          <div>
                            <p className="mb-2 font-semibold text-neutral-400">3. Enablement and Authorization</p>
                            <p className="mb-2">
                              <span className="font-medium">3.1. Administrator Activation:</span> Only users with
                              Administrator-level privileges may accept these AI Terms and enable the AI Copilot for
                              their organization.
                            </p>
                            <p className="mb-2">
                              <span className="font-medium">3.2. Organization-Wide Scope:</span> By enabling the AI
                              Copilot, the Administrator activates the feature for all team members within the
                              organization.
                            </p>
                            <p>
                              <span className="font-medium">3.3. Voluntary Adoption:</span> Use of the AI Copilot is
                              entirely optional and not required to use the Qovery platform.
                            </p>
                          </div>

                          <div>
                            <p className="mb-2 font-semibold text-neutral-400">4. Third-Party AI Services</p>
                            <p className="mb-2">
                              <span className="font-medium">4.1. Anthropic Integration:</span> The AI Copilot is powered
                              by Anthropic's Claude AI model, subject to Anthropic's Commercial Terms.
                            </p>
                            <p>
                              <span className="font-medium">4.2. Data Processing:</span> By enabling this feature, you
                              acknowledge that your queries and relevant platform context may be processed by
                              Anthropic's AI services in accordance with their terms and privacy policies.
                            </p>
                          </div>

                          <div>
                            <p className="mb-2 font-semibold text-neutral-400">
                              5. User Responsibilities and Acceptable Use
                            </p>
                            <p className="mb-2">
                              <span className="font-medium">5.1. Proper Usage:</span> You agree to use the AI Copilot
                              solely for its intended purpose of assisting with legitimate Qovery platform operations.
                            </p>
                            <p className="mb-1">
                              <span className="font-medium">5.2. Prohibited Activities:</span> You must not:
                            </p>
                            <ul className="ml-4 list-disc space-y-1">
                              <li>Attempt to manipulate, jailbreak, or bypass the AI model's safety mechanisms</li>
                              <li>Use the AI Copilot for purposes unrelated to the Qovery platform</li>
                              <li>Exploit the feature to gain unauthorized access or perform malicious activities</li>
                              <li>
                                Share, distribute, or repurpose AI-generated content in ways that violate applicable
                                laws or third-party rights
                              </li>
                            </ul>
                            <p className="mt-2">
                              <span className="font-medium">5.3. Confirmation of Actions:</span> You are responsible for
                              reviewing and confirming all actions proposed by the AI Copilot before execution. The
                              confirmation step is a critical safeguard that you must not circumvent.
                            </p>
                          </div>

                          <div>
                            <p className="mb-2 font-semibold text-neutral-400">6. Limitations of Liability</p>
                            <p className="mb-2">
                              <span className="font-medium">6.1. AI-Generated Responses:</span> The AI Copilot provides
                              suggestions and executes actions based on AI-generated interpretations. Qovery makes no
                              warranties regarding the accuracy, completeness, or appropriateness of AI-generated
                              responses.
                            </p>
                            <p className="mb-1">
                              <span className="font-medium">6.2. User Accountability:</span> You acknowledge and agree
                              that:
                            </p>
                            <ul className="ml-4 list-disc space-y-1">
                              <li>You bear sole responsibility for all actions taken using the AI Copilot</li>
                              <li>
                                Qovery is not liable for any damages, losses, or service disruptions resulting from AI
                                Copilot usage, including but not limited to: misconfigured resources, unintended
                                deletions or modifications, service interruptions, or data loss
                              </li>
                            </ul>
                            <p className="mt-2">
                              <span className="font-medium">6.3. No Guarantee of Safeguards:</span> While Qovery
                              implements safeguards and confirmation mechanisms, you acknowledge that no system is
                              infallible, and you assume all risk associated with using the AI Copilot.
                            </p>
                            <p className="mt-2">
                              <span className="font-medium">6.4. AS-IS Provision:</span> THE AI COPILOT IS PROVIDED "AS
                              IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
                            </p>
                          </div>

                          <div>
                            <p className="mb-2 font-semibold text-neutral-400">7. Suspension and Termination Rights</p>
                            <p className="mb-2">
                              <span className="font-medium">7.1. Qovery's Rights:</span> Qovery reserves the right, at
                              its sole discretion and without prior notice, to suspend or revoke access to the AI
                              Copilot feature for your organization, suspend or terminate your Qovery account and
                              services, or investigate suspected violations of these AI Terms.
                            </p>
                            <p>
                              <span className="font-medium">7.2. Grounds for Suspension:</span> Actions that may result
                              in suspension or termination include, but are not limited to: attempts to jailbreak,
                              manipulate, or bypass AI model constraints, abusive or malicious use, violations of
                              applicable laws, or any violation of these AI Terms or the Qovery Terms of Service.
                            </p>
                          </div>

                          <div>
                            <p className="mb-2 font-semibold text-neutral-400">8. Changes to These Terms</p>
                            <p>
                              Qovery may modify these AI Terms at any time. Continued use of the AI Copilot after
                              changes constitutes acceptance of the modified terms. Material changes will be
                              communicated through the Qovery platform or via email.
                            </p>
                          </div>

                          <div>
                            <p className="mb-2 font-semibold text-neutral-400">9. Data and Privacy</p>
                            <p className="mb-2">
                              <span className="font-medium">9.1. Data Usage:</span> Information processed through the AI
                              Copilot, including queries, commands, and platform context, may be used to provide the
                              service and improve feature functionality.
                            </p>
                            <p>
                              <span className="font-medium">9.2. Retention:</span> Conversation history and AI
                              interactions are stored in accordance with Qovery's data retention policies and applicable
                              privacy regulations.
                            </p>
                          </div>

                          <div>
                            <p className="mb-2 font-semibold text-neutral-400">10. Severability</p>
                            <p>
                              If any provision of these AI Terms is found to be unenforceable or invalid, that provision
                              will be limited or eliminated to the minimum extent necessary, and the remaining
                              provisions will remain in full force and effect.
                            </p>
                          </div>

                          <div>
                            <p className="mb-2 font-semibold text-neutral-400">11. Governing Law</p>
                            <p>
                              These AI Terms are governed by the same laws and jurisdiction provisions as the Qovery
                              Terms of Service.
                            </p>
                          </div>

                          <div>
                            <p className="mb-2 font-semibold text-neutral-400">12. Contact</p>
                            <p>
                              For questions regarding these AI Terms, please contact:{' '}
                              <a href="mailto:support@qovery.com" className="text-brand-500 hover:underline">
                                support@qovery.com
                              </a>
                            </p>
                          </div>

                          <div className="border-t border-neutral-250 pt-4">
                            <p className="font-medium text-neutral-400">
                              By clicking "I Accept" and enabling the AI Copilot, you acknowledge that you:
                            </p>
                            <ul className="ml-4 mt-2 list-disc space-y-1">
                              <li>Have read and understood these AI Copilot Additional Terms</li>
                              <li>Have the authority to bind your organization to these terms</li>
                              <li>Accept these terms on behalf of your organization and all its users</li>
                              <li>Understand the risks associated with AI-assisted operations</li>
                              <li>Agree to use the AI Copilot responsibly and in compliance with these terms</li>
                            </ul>
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
            </BlockContent>
          )}

          {isEnabled && (
            <BlockContent title="Configuration" classNameContent="p-0">
              {isLoading ? (
                <div className="flex justify-center p-5">
                  <LoaderSpinner className="w-5" />
                </div>
              ) : (
                <div className="space-y-6 p-6">
                  <div className="-mx-6 border-b border-neutral-250 px-6 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-brand-500">
                        <Icon iconName="robot" className="text-white" width="20px" height="20px" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-400">AI Copilot for {organization?.name}</p>
                        <p className="text-xs text-neutral-350">AI-powered assistance is currently active</p>
                      </div>
                      <Button
                        size="md"
                        color="red"
                        loading={updateConfigMutation.isLoading}
                        onClick={() => {
                          openModal({
                            content: (
                              <div className="p-6">
                                <h2 className="h4 mb-2 text-neutral-400">Disable AI Copilot</h2>
                                <p className="mb-6 text-sm text-neutral-350">
                                  Are you sure you want to disable AI Copilot? This will stop all AI-powered assistance
                                  for your organization.
                                </p>
                                <div className="flex justify-end gap-3">
                                  <Button
                                    type="button"
                                    color="neutral"
                                    variant="plain"
                                    size="lg"
                                    onClick={() => closeModal()}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="button"
                                    size="lg"
                                    color="red"
                                    onClick={() => {
                                      closeModal()
                                      handleToggleCopilot()
                                    }}
                                  >
                                    Disable
                                  </Button>
                                </div>
                              </div>
                            ),
                          })
                        }}
                      >
                        Disable
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
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
                        <Button
                          size="md"
                          color="brand"
                          onClick={handleSaveMode}
                          loading={updateConfigMutation.isLoading}
                        >
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

                    <Callout.Root color="sky" className="mt-4">
                      <Callout.Icon>
                        <Icon name={IconAwesomeEnum.CIRCLE_INFO} />
                      </Callout.Icon>
                      <Callout.Text>
                        <Callout.TextHeading>
                          {mode === 'read-only' ? 'Read-Only Mode' : 'Read-Write Mode'}
                        </Callout.TextHeading>
                        <Callout.TextDescription>
                          {mode === 'read-only'
                            ? 'AI Copilot can view your infrastructure configuration but cannot make changes. Perfect for analysis and recommendations.'
                            : 'AI Copilot can view and modify your infrastructure configuration. Use with caution as it has full access to your resources.'}
                        </Callout.TextDescription>
                      </Callout.Text>
                    </Callout.Root>
                  </div>
                </div>
              )}
            </BlockContent>
          )}
        </Section>

        {isEnabled && tasks.length > 0 && (
          <Section>
            <div className="mb-8 flex justify-between gap-2">
              <div className="space-y-3">
                <Heading>Scheduled Tasks</Heading>
                <p className="text-xs text-neutral-400">Recurring tasks configured for your organization</p>
              </div>
            </div>
            <BlockContent title="Tasks List" classNameContent="p-0">
              <ul>
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between border-b border-neutral-250 px-5 py-4 last:border-0"
                  >
                    <div className="flex">
                      <Icon
                        name={task.enabled ? IconAwesomeEnum.CLOCK : IconAwesomeEnum.PAUSE}
                        className={task.enabled ? 'text-brand-500' : 'text-neutral-350'}
                        width="20px"
                        height="20px"
                      />
                      <div className="ml-4">
                        <p className="mb-1 flex text-xs font-medium text-neutral-400">{task.user_intent}</p>
                        <p className="text-xs text-neutral-350">
                          <span className="inline-block">Schedule: {task.cron_expression}</span>
                          {task.last_run_at && (
                            <span className="ml-3 inline-block">
                              Last run: {new Date(task.last_run_at).toLocaleString()}
                            </span>
                          )}
                          {task.error_count > 0 && (
                            <span className="ml-3 inline-block text-red-500">Errors: {task.error_count}</span>
                          )}
                        </p>
                        {task.last_error && <p className="mt-1 text-xs text-red-500">{task.last_error}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <InputToggle
                        title={`${task.enabled ? 'Enabled' : 'Disabled'}`}
                        className="mr-5"
                        value={task.enabled}
                        small
                        onChange={() => toggleTaskMutation.mutate({ taskId: task.id })}
                      />
                      <Button
                        variant="surface"
                        color="neutral"
                        size="md"
                        onClick={() => {
                          openModal({
                            content: (
                              <div className="p-6">
                                <h2 className="h4 mb-2 text-neutral-400">Delete Task</h2>
                                <p className="mb-6 text-sm text-neutral-350">
                                  Are you sure you want to delete this task? This action cannot be undone.
                                </p>
                                <div className="flex justify-end gap-3">
                                  <Button
                                    type="button"
                                    color="neutral"
                                    variant="plain"
                                    size="lg"
                                    onClick={() => closeModal()}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="button"
                                    size="lg"
                                    color="red"
                                    onClick={() => {
                                      closeModal()
                                      deleteTaskMutation.mutate({ taskId: task.id })
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ),
                          })
                        }}
                        loading={deleteTaskMutation.isLoading}
                      >
                        <Icon iconName="trash-can" iconStyle="regular" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </BlockContent>
          </Section>
        )}
      </div>
    </div>
  )
}

export default PageOrganizationAICopilot
