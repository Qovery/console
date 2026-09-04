import { Controller, type UseFormReturn } from 'react-hook-form'
import { InputTextArea } from '@qovery/shared/ui'
import { type AgenticWorkflowSettingsFormValues } from '../agentic-workflow-settings'
import { AgenticWorkflowSettingsCard } from '../agentic-workflow-settings-card'

export function AgenticWorkflowGovernanceSettings({
  form,
}: {
  form: UseFormReturn<AgenticWorkflowSettingsFormValues>
}) {
  return (
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
  )
}
