import { useParams } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useEnvironments } from '@qovery/domains/environments/feature'
import { useProjects } from '@qovery/domains/projects/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import {
  BlockContent,
  Button,
  Icon,
  InputSearch,
  InputSelect,
  InputText,
  InputTextArea,
  InputToggle,
  Popover,
  Section,
  Skeleton,
  dropdownMenuItemVariants,
  toast,
  useModal,
} from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { SLACK_BOT_API_URL } from '@qovery/shared/util-node-env'

interface SlackInstallation {
  id: string
  slack_team_id: string
  slack_team_name: string
  active: boolean
  error_state: string | null
  created_at: string
}

interface AlertRule {
  id: string
  installation_id: string
  qovery_organization_id: string
  name: string
  qovery_project_ids: string[]
  qovery_environment_ids: string[]
  slack_channel_id: string
  alert_deployment_failed: boolean
  alert_failure_loop: boolean
  alert_recovered: boolean
  environment_types: string[]
  message_template?: { block_type: string; enabled: boolean; custom_text?: string }[] | null
  created_at: string
}

interface SlackChannel {
  id: string
  name: string
  is_private: boolean
}

const ENV_TYPES = ['PRODUCTION', 'STAGING', 'DEVELOPMENT', 'PREVIEW'] as const

const SlackIntegrationSkeleton = () => (
  <BlockContent title="Workspace" classNameContent="p-0">
    {[0, 1].map((index) => (
      <div key={index} className="flex items-center justify-between border-b border-neutral p-4 last:border-0">
        <Skeleton width={200} height={16} show />
      </div>
    ))}
  </BlockContent>
)

const ALERT_VARIABLES = [
  'organization_name',
  'project_name',
  'environment_name',
  'environment_type',
  'failed_services',
  'failed_step',
  'triggered_by',
  'error_message',
  'console_url',
  'logs_url',
  'alert_settings_url',
]

function VariableDropdown({ onInsert }: { onInsert: (variable: string) => void }) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = ALERT_VARIABLES.filter((v) => v.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        <Button
          aria-label="Insert variable"
          size="md"
          type="button"
          color="neutral"
          variant="surface"
          iconOnly
          className="absolute right-2 top-2 h-8 w-8 justify-center"
        >
          <Icon className="text-sm" iconName="wand-magic-sparkles" />
        </Button>
      </Popover.Trigger>
      <Popover.Content className="z-50 flex max-h-60 w-[300px] min-w-[300px] flex-col p-2">
        <div onKeyDown={(e) => e.stopPropagation()}>
          <InputSearch
            placeholder="Search variable..."
            className="mb-1"
            onChange={(value) => setSearchTerm(value)}
            autofocus
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((variable) => (
              <button
                key={variable}
                type="button"
                className={dropdownMenuItemVariants({ color: 'brand' })}
                onClick={() => {
                  onInsert(variable)
                  setOpen(false)
                  setSearchTerm('')
                }}
              >
                <span className="text-sm font-medium">{variable}</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-6 text-center">
              <Icon iconName="wave-pulse" className="text-neutral-subtle" />
              <p className="mt-1 text-xs font-medium text-neutral-subtle">No result for this search</p>
            </div>
          )}
        </div>
      </Popover.Content>
    </Popover.Root>
  )
}

function AlertRuleForm({
  organizationId,
  installationId,
  existingRule,
  onSaved,
  onCancel,
}: {
  organizationId: string
  installationId: string
  existingRule?: AlertRule
  onSaved: () => void
  onCancel: () => void
}) {
  const isEditing = !!existingRule
  const customTextBlock = existingRule?.message_template?.find((b) => b.block_type === 'custom_text')

  const [channels, setChannels] = useState<SlackChannel[]>([])
  const [loadingChannels, setLoadingChannels] = useState(true)
  const [ruleName, setRuleName] = useState(existingRule?.name ?? '')
  const [selectedChannel, setSelectedChannel] = useState(existingRule?.slack_channel_id ?? '')
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(existingRule?.qovery_project_ids ?? [])
  const [selectedEnvironmentIds, setSelectedEnvironmentIds] = useState<string[]>(
    existingRule?.qovery_environment_ids ?? []
  )
  const [alertFailed, setAlertFailed] = useState(existingRule?.alert_deployment_failed ?? true)
  const [alertLoop, setAlertLoop] = useState(existingRule?.alert_failure_loop ?? true)
  const [alertRecovered, setAlertRecovered] = useState(existingRule?.alert_recovered ?? true)
  const [envTypes, setEnvTypes] = useState<string[]>(existingRule?.environment_types ?? ['PRODUCTION', 'STAGING'])
  const [saving, setSaving] = useState(false)
  const [customMessage, setCustomMessage] = useState(customTextBlock?.custom_text ?? '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { data: projects } = useProjects({ organizationId })
  const { data: environments } = useEnvironments({
    projectId: selectedProjectIds.length === 1 ? selectedProjectIds[0] : '',
  })

  useEffect(() => {
    if (!SLACK_BOT_API_URL) return
    fetch(`${SLACK_BOT_API_URL}/api/v1/org/${organizationId}/channels`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: SlackChannel[]) => {
        setChannels(data)
        if (!existingRule && data.length > 0) setSelectedChannel(data[0].id)
      })
      .catch(() => setChannels([]))
      .finally(() => setLoadingChannels(false))
  }, [organizationId])

  const handleSave = async () => {
    if (!SLACK_BOT_API_URL || !selectedChannel || envTypes.length === 0) return

    setSaving(true)
    try {
      const payload = {
        name: ruleName.trim(),
        slack_channel_id: selectedChannel,
        qovery_project_ids: selectedProjectIds,
        qovery_environment_ids: selectedEnvironmentIds,
        alert_deployment_failed: alertFailed,
        alert_failure_loop: alertLoop,
        alert_recovered: alertRecovered,
        environment_types: envTypes,
        message_template: customMessage.trim()
          ? [
              { block_type: 'custom_text', enabled: true, custom_text: customMessage.trim() },
              { block_type: 'actions', enabled: true },
            ]
          : null,
      }

      if (isEditing) {
        const res = await fetch(
          `${SLACK_BOT_API_URL}/api/v1/org/${organizationId}/alert-rules/${existingRule.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        )
        if (res.ok) {
          toast('success', 'Alert rule updated')
          onSaved()
        } else {
          toast('error', 'Failed to update alert rule')
        }
      } else {
        const res = await fetch(`${SLACK_BOT_API_URL}/api/v1/org/${organizationId}/alert-rules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ installation_id: installationId, ...payload }),
        })
        if (res.ok) {
          toast('success', 'Alert rule created')
          onSaved()
        } else {
          toast('error', 'Failed to create alert rule')
        }
      }
    } catch {
      toast('error', 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loadingChannels) {
    return (
      <div className="border-t border-neutral p-4">
        <Skeleton width={300} height={32} show />
      </div>
    )
  }

  const channelOptions = channels.map((ch) => ({
    label: `${ch.is_private ? '🔒 ' : '# '}${ch.name}`,
    value: ch.id,
  }))

  const projectOptions = (projects ?? []).map((p) => ({
    label: p.name,
    value: p.id,
  }))

  const environmentOptions = (environments ?? []).map((e) => ({
    label: e.name,
    value: e.id,
  }))

  return (
    <div className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto p-6">
      <h2 className="text-lg font-medium text-neutral">{isEditing ? 'Edit alert rule' : 'Create alert rule'}</h2>

      <InputText
        label="Name"
        name="rule_name"
        value={ruleName}
        onChange={(e) => setRuleName(e.currentTarget.value)}
        hint="Give your alert rule a descriptive name."
      />

      <InputSelect
        label="Channel"
        options={channelOptions}
        value={selectedChannel}
        onChange={(value) => setSelectedChannel(value as string)}
        hint="Private channels require the bot to be invited first (/invite @Qovery Alerts)"
      />

      <InputSelect
        label="Projects"
        options={projectOptions}
        value={selectedProjectIds}
        onChange={(value) => {
          setSelectedProjectIds(value as string[])
          setSelectedEnvironmentIds([])
        }}
        isMulti
        isSearchable
        hint="Leave empty to apply to all projects in the organization."
      />

      {selectedProjectIds.length === 1 && (
        <InputSelect
          label="Environments"
          options={environmentOptions}
          value={selectedEnvironmentIds}
          onChange={(value) => setSelectedEnvironmentIds(value as string[])}
          isMulti
          isSearchable
          hint="Leave empty to apply to all environments in the selected project."
        />
      )}

      <InputSelect
        label="Environment type filter"
        options={ENV_TYPES.map((type) => ({ label: type, value: type }))}
        value={envTypes}
        onChange={(value) => setEnvTypes(value as string[])}
        isMulti
        hint="Alerts will only fire for deployments on environments matching these types."
      />

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-neutral">Alert types</span>
        <div className="flex flex-col gap-3">
          <InputToggle
            small
            value={alertFailed}
            onChange={setAlertFailed}
            title="Deployment failed"
            description="Send an alert on the first failure of a deployment."
          />
          <InputToggle
            small
            value={alertLoop}
            onChange={setAlertLoop}
            title="Failure loop"
            description="Send an alert when the same environment fails 5, 10, 20, or 50 times in a row."
          />
          <InputToggle
            small
            value={alertRecovered}
            onChange={setAlertRecovered}
            title="Recovered"
            description="Send a thread reply when a previously failed environment deploys successfully."
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-neutral">Custom message (optional)</span>
        <p className="text-xs text-neutral-subtle">
          Leave empty for the default message. Use the wand button to insert variables.
        </p>
        <div className="relative">
          <InputTextArea
            ref={textareaRef}
            label="Message"
            name="custom_message"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.currentTarget.value)}
          />
          <VariableDropdown
            onInsert={(variable) => {
              const textarea = textareaRef.current
              if (!textarea) return
              const start = textarea.selectionStart
              const end = textarea.selectionEnd
              const insert = `{{${variable}}}`
              const newValue = customMessage.slice(0, start) + insert + customMessage.slice(end)
              setCustomMessage(newValue)
              requestAnimationFrame(() => {
                textarea.focus()
                textarea.selectionStart = textarea.selectionEnd = start + insert.length
              })
            }}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button size="md" variant="outline" color="neutral" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="md" onClick={handleSave} loading={saving} disabled={!selectedChannel || envTypes.length === 0}>
          {isEditing ? 'Save' : 'Create rule'}
        </Button>
      </div>
    </div>
  )
}

function formatScope(rule: AlertRule, projects: { id: string; name: string }[]): string {
  if (rule.qovery_environment_ids?.length > 0) {
    const projectNames = projects
      .filter((p) => rule.qovery_project_ids?.includes(p.id))
      .map((p) => p.name)
    const count = rule.qovery_environment_ids.length
    return `${count} env${count > 1 ? 's' : ''}${projectNames.length > 0 ? ` · ${projectNames.join(', ')}` : ''}`
  }
  if (rule.qovery_project_ids?.length > 0) {
    const projectNames = projects
      .filter((p) => rule.qovery_project_ids.includes(p.id))
      .map((p) => p.name)
    return projectNames.length > 0 ? projectNames.join(', ') : 'Selected projects'
  }
  return 'All projects'
}

function SlackInstallationList({
  organizationId,
  onInstallationsLoaded,
}: {
  organizationId: string
  onInstallationsLoaded: (hasInstallation: boolean) => void
}) {
  const [installations, setInstallations] = useState<SlackInstallation[]>([])
  const [alertRules, setAlertRules] = useState<AlertRule[]>([])
  const [channels, setChannels] = useState<SlackChannel[]>([])
  const [loading, setLoading] = useState(true)
  const { openModal, closeModal } = useModal()
  const { data: projects } = useProjects({ organizationId })

  const channelNameMap = new Map(channels.map((ch) => [ch.id, ch.name]))

  const fetchData = useCallback(async () => {
    if (!SLACK_BOT_API_URL) return

    try {
      const [installsRes, rulesRes, channelsRes] = await Promise.all([
        fetch(`${SLACK_BOT_API_URL}/api/v1/org/${organizationId}/installations`),
        fetch(`${SLACK_BOT_API_URL}/api/v1/org/${organizationId}/alert-rules`),
        fetch(`${SLACK_BOT_API_URL}/api/v1/org/${organizationId}/channels`),
      ])

      if (installsRes.ok) {
        const data = await installsRes.json()
        setInstallations(data)
        onInstallationsLoaded(data.length > 0)
      }
      if (rulesRes.ok) setAlertRules(await rulesRes.json())
      if (channelsRes.ok) setChannels(await channelsRes.json())
    } catch (error) {
      console.error('Failed to fetch Slack integration data:', error)
    } finally {
      setLoading(false)
    }
  }, [organizationId, onInstallationsLoaded])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) return <SlackIntegrationSkeleton />

  const hasInstallation = installations.length > 0
  const firstInstallation = installations[0]

  return (
    <div className="flex flex-col gap-6">
      <BlockContent title="Workspace" classNameContent="p-0">
        {hasInstallation ? (
          <ul className="flex flex-col">
            {installations.map((install) => (
              <li
                key={install.id}
                className="flex items-center justify-between border-b border-neutral p-4 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Icon iconName="slack" iconStyle="brands" className="text-lg" />
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-neutral">{install.slack_team_name}</p>
                    <p className="text-xs text-neutral-subtle">Connected</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  iconOnly
                  color="neutral"
                  size="md"
                  aria-label="Disconnect workspace"
                  onClick={async () => {
                    if (!SLACK_BOT_API_URL) return
                    try {
                      const res = await fetch(`${SLACK_BOT_API_URL}/api/v1/org/${organizationId}/installations`, {
                        method: 'DELETE',
                      })
                      if (res.ok) {
                        toast('success', 'Slack workspace disconnected')
                        fetchData()
                      } else {
                        toast('error', 'Failed to disconnect workspace')
                      }
                    } catch {
                      toast('error', 'An error occurred')
                    }
                  }}
                >
                  <Icon iconName="trash-can" iconStyle="regular" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-6 text-center">
            <Icon iconName="slack" iconStyle="brands" className="text-2xl text-neutral-subtle" />
            <p className="mt-2 text-sm text-neutral-subtle">
              No Slack workspace connected. Click "Add to Slack" to get started.
            </p>
          </div>
        )}
      </BlockContent>

      {hasInstallation && (
        <BlockContent
          title="Alert rules"
          classNameContent="p-0"
          headRight={
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (!firstInstallation) return
                openModal({
                  content: (
                    <AlertRuleForm
                      organizationId={organizationId}
                      installationId={firstInstallation.id}
                      onSaved={() => {
                        closeModal()
                        fetchData()
                      }}
                      onCancel={closeModal}
                    />
                  ),
                })
              }}
            >
              <Icon iconName="circle-plus" iconStyle="regular" />
              Add rule
            </Button>
          }
        >
          {alertRules.length > 0 ? (
            <ul className="flex flex-col">
              {alertRules.map((rule) => {
                const channelName = channelNameMap.get(rule.slack_channel_id)
                return (
                  <li
                    key={rule.id}
                    className="flex items-center justify-between border-b border-neutral p-4 last:border-0"
                  >
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-neutral">
                        {rule.name || (channelName ? `#${channelName}` : rule.slack_channel_id)}
                      </p>
                      <div className="flex gap-3 text-xs text-neutral-subtle">
                        {channelName && <span>#{channelName}</span>}
                        <span>{formatScope(rule, projects ?? [])}</span>
                        <span>·</span>
                        <span>{rule.environment_types.join(', ')}</span>
                        <span>·</span>
                        <span>
                          {[
                            rule.alert_deployment_failed && 'Failed',
                            rule.alert_failure_loop && 'Loop',
                            rule.alert_recovered && 'Recovered',
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        iconOnly
                        color="neutral"
                        size="md"
                        aria-label="Edit alert rule"
                        onClick={() => {
                          if (!firstInstallation) return
                          openModal({
                            content: (
                              <AlertRuleForm
                                organizationId={organizationId}
                                installationId={firstInstallation.id}
                                existingRule={rule}
                                onSaved={() => {
                                  closeModal()
                                  fetchData()
                                }}
                                onCancel={closeModal}
                              />
                            ),
                          })
                        }}
                      >
                        <Icon iconName="pen" iconStyle="regular" />
                      </Button>
                      <Button
                        variant="outline"
                        iconOnly
                        color="neutral"
                        size="md"
                        aria-label="Delete alert rule"
                        onClick={async () => {
                          if (!SLACK_BOT_API_URL) return
                          try {
                            const res = await fetch(
                              `${SLACK_BOT_API_URL}/api/v1/org/${organizationId}/alert-rules/${rule.id}`,
                              { method: 'DELETE' }
                            )
                            if (res.ok) {
                              toast('success', 'Alert rule deleted')
                              fetchData()
                            } else {
                              toast('error', 'Failed to delete alert rule')
                            }
                          } catch {
                            toast('error', 'An error occurred')
                          }
                        }}
                      >
                        <Icon iconName="trash-can" iconStyle="regular" />
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="p-4 text-center">
              <p className="text-xs text-neutral-subtle">No alert rules configured yet.</p>
            </div>
          )}
        </BlockContent>
      )}
    </div>
  )
}

export function SettingsSlackIntegration() {
  useDocumentTitle('Slack integration - Organization settings')
  const { organizationId = '' } = useParams({ strict: false })
  const [hasInstallation, setHasInstallation] = useState(false)

  const addToSlack = () => {
    if (!SLACK_BOT_API_URL) return
    window.location.href = `${SLACK_BOT_API_URL}/slack/install-url?org_id=${organizationId}`
  }

  if (!SLACK_BOT_API_URL) {
    return (
      <div className="w-full">
        <Section className="px-8 pb-8 pt-6">
          <SettingsHeading
            title="Slack"
            description="Slack integration is not configured. Contact your administrator."
          />
        </Section>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Section className="px-8 pb-8 pt-6">
        <div className="relative">
          <SettingsHeading
            title="Slack"
            description="Get notified in Slack when deployments fail, detect failure loops, and know when environments recover."
          />
          <Button size="md" className="absolute right-0 top-0 shrink-0" onClick={addToSlack}>
            <Icon iconName="slack" iconStyle="brands" />
            {hasInstallation ? 'Reconnect Slack' : 'Add to Slack'}
          </Button>
        </div>
        <div className="max-w-content-with-navigation-left">
          <SlackInstallationList organizationId={organizationId} onInstallationsLoaded={setHasInstallation} />
        </div>
      </Section>
    </div>
  )
}
