import { AgenticWorkflowWebhookAuthMode, type AgenticWorkflowWebhookAuthResponse } from 'qovery-typescript-axios'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { InputSelect, InputText, InputTextArea } from '@qovery/shared/ui'
import { type AgenticWorkflowSettingsFormValues } from '../agentic-workflow-settings'
import { AgenticWorkflowSettingsCard } from '../agentic-workflow-settings-card'
import {
  DEFAULT_WEBHOOK_AUTH_HEADER_NAME,
  SELECTABLE_WEBHOOK_AUTH_MODES,
  getWebhookAuthModeLabel,
  validateWebhookAuthHeaderName,
  validateWebhookAuthSecret,
} from '../agentic-workflow-webhook-auth'

export function AgenticWorkflowGovernanceSettings({
  form,
  savedWebhookAuth,
}: {
  form: UseFormReturn<AgenticWorkflowSettingsFormValues>
  savedWebhookAuth?: AgenticWorkflowWebhookAuthResponse
}) {
  const webhookAuthMode = form.watch('webhookAuthMode')
  const savedMode = savedWebhookAuth?.mode
  const hasStoredSecret = savedMode === AgenticWorkflowWebhookAuthMode.SECRET_HEADER
  // Keep a provider mode set through the API visible instead of showing it as another mode.
  const modes = SELECTABLE_WEBHOOK_AUTH_MODES.includes(webhookAuthMode)
    ? SELECTABLE_WEBHOOK_AUTH_MODES
    : [...SELECTABLE_WEBHOOK_AUTH_MODES, webhookAuthMode]

  return (
    <>
      <AgenticWorkflowSettingsCard title="Network access" description="Restrict the hosts the agent task can access.">
        <Controller
          name="hostAllowlist"
          control={form.control}
          render={({ field }) => (
            <InputTextArea
              {...field}
              label="Domain allowlist"
              hint="Use * to allow all domains, or enter hostnames separated by commas."
            />
          )}
        />
      </AgenticWorkflowSettingsCard>
      <AgenticWorkflowSettingsCard
        title="Webhook authentication"
        description="Choose how callers of the agent task webhook prove their identity."
      >
        <Controller
          name="webhookAuthMode"
          control={form.control}
          render={({ field }) => (
            <InputSelect
              label="Authentication"
              value={field.value}
              onChange={(value) => field.onChange(value as AgenticWorkflowWebhookAuthMode)}
              options={modes.map((mode) => ({ value: mode, label: getWebhookAuthModeLabel(mode) }))}
              hint={
                webhookAuthMode === AgenticWorkflowWebhookAuthMode.NONE
                  ? 'Anyone who knows the webhook URL can trigger the agent task.'
                  : webhookAuthMode === AgenticWorkflowWebhookAuthMode.SECRET_HEADER
                    ? 'Callers must send the secret in the header below. Other calls are rejected with 401.'
                    : undefined
              }
            />
          )}
        />
        {webhookAuthMode === AgenticWorkflowWebhookAuthMode.SECRET_HEADER ? (
          <>
            <Controller
              name="webhookAuthHeaderName"
              control={form.control}
              rules={{ validate: validateWebhookAuthHeaderName }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Header name"
                  placeholder={DEFAULT_WEBHOOK_AUTH_HEADER_NAME}
                  hint={`Leave empty to use ${DEFAULT_WEBHOOK_AUTH_HEADER_NAME}.`}
                  error={error?.message}
                />
              )}
            />
            <Controller
              name="webhookAuthSecret"
              control={form.control}
              rules={{ validate: (value) => validateWebhookAuthSecret(value, webhookAuthMode, savedMode) }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  type="password"
                  autoComplete="new-password"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label={hasStoredSecret ? 'New secret' : 'Secret'}
                  hint={
                    hasStoredSecret
                      ? 'Leave empty to keep the current secret. Enter a new one to rotate it.'
                      : '16 to 1024 printable ASCII characters. Qovery stores only its hash: copy it now.'
                  }
                  error={error?.message}
                />
              )}
            />
          </>
        ) : null}
      </AgenticWorkflowSettingsCard>
    </>
  )
}
