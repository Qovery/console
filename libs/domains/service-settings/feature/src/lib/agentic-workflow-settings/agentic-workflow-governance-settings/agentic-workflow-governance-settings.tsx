import { Controller, type UseFormReturn } from 'react-hook-form'
import { InputTextArea } from '@qovery/shared/ui'
import { AgenticWorkflowSettingsCard } from '../agentic-workflow-settings-card'
import { type AgenticWorkflowSettingsFormValues } from '../agentic-workflow-settings.types'

export function AgenticWorkflowGovernanceSettings({
  form,
}: {
  form: UseFormReturn<AgenticWorkflowSettingsFormValues>
}) {
  return (
    <AgenticWorkflowSettingsCard
      title="Network access"
      description="Restrict outbound hosts and incoming webhook source addresses."
    >
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
      <Controller
        name="webhookIpAllowlist"
        control={form.control}
        render={({ field }) => (
          <InputTextArea {...field} label="Webhook IP allowlist" hint="Enter CIDR ranges separated by commas." />
        )}
      />
    </AgenticWorkflowSettingsCard>
  )
}
