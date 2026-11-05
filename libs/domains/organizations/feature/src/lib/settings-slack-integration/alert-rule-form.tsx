import posthog from 'posthog-js'
import { useEffect, useRef, useState } from 'react'
import { useEnvironments } from '@qovery/domains/environments/feature'
import { useProjects } from '@qovery/domains/projects/feature'
import { Button, InputSelect, InputText, InputTextArea, InputToggle, Skeleton, toast } from '@qovery/shared/ui'
import { SLACK_BOT_API_URL } from '@qovery/shared/util-node-env'
import { type AlertRule, ENV_TYPES, type SlackChannel } from './types'
import { VariableDropdown } from './variable-dropdown'

export function AlertRuleForm({
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
  const [nameManuallyEdited, setNameManuallyEdited] = useState(!!existingRule?.name)
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
  const DEFAULT_MESSAGE =
    '🚨 Deployment failed on {{environment_name}} ({{environment_type}}) in {{project_name}}. Failed services: {{failed_services}}. Triggered by {{triggered_by}}.'
  const [customMessage, setCustomMessage] = useState(customTextBlock?.custom_text ?? DEFAULT_MESSAGE)
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
        if (!existingRule && data.length > 0) {
          setSelectedChannel(data[0].id)
          setRuleName(`#${data[0].name}`)
        }
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
        const res = await fetch(`${SLACK_BOT_API_URL}/api/v1/org/${organizationId}/alert-rules/${existingRule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          toast('success', 'Alert rule updated')
          posthog.capture('slack-alert-rule-updated', { organization_id: organizationId })
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
          posthog.capture('slack-alert-rule-created', { organization_id: organizationId })
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

      <InputSelect
        label="Channel"
        options={channelOptions}
        value={selectedChannel}
        onChange={(value) => {
          setSelectedChannel(value as string)
          if (!nameManuallyEdited) {
            const channel = channels.find((ch) => ch.id === value)
            if (channel) setRuleName(`#${channel.name}`)
          }
        }}
        isSearchable
        hint="Private channels require the bot to be invited first (/invite @Qovery Alerts)"
      />

      <InputText
        label="Name"
        name="rule_name"
        value={ruleName}
        onChange={(e) => {
          setRuleName(e.currentTarget.value)
          setNameManuallyEdited(true)
        }}
        hint="Give your alert rule a descriptive name."
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
        <span className="text-sm font-medium text-neutral">Alert types</span>
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
        <span className="text-sm font-medium text-neutral">Failure event message (optional)</span>
        <p className="text-sm text-neutral-subtle">
          Customize the message sent when a deployment fails. Use the wand button to insert variables.
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
