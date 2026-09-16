import { type LlmProviderResponse } from 'qovery-typescript-axios'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { LlmProviderSetting } from '@qovery/domains/organizations/feature'
import { AgenticWorkflowCodeEditorField, AgenticWorkflowPromptEditor } from '@qovery/domains/services/feature'
import { type AgenticWorkflowSettingsFormValues } from '../agentic-workflow-settings'
import { AgenticWorkflowSettingsCard } from '../agentic-workflow-settings-card'

function getJsonError(value: string) {
  try {
    JSON.parse(value)
    return undefined
  } catch {
    return 'Invalid JSON format.'
  }
}

export function AgenticWorkflowAiConfigurationSettings({
  form,
  llmProviders,
}: {
  form: UseFormReturn<AgenticWorkflowSettingsFormValues>
  llmProviders: LlmProviderResponse[]
}) {
  return (
    <>
      <AgenticWorkflowSettingsCard
        title="Provider"
        description="Configure the Anthropic credentials and cloud settings."
      >
        <Controller
          name="llmProviderId"
          control={form.control}
          render={({ field }) => (
            <LlmProviderSetting llmProviders={llmProviders} value={field.value} onChange={field.onChange} />
          )}
        />
        <Controller
          name="modelSettings"
          control={form.control}
          render={({ field }) => (
            <AgenticWorkflowCodeEditorField
              name={field.name}
              label="Cloud settings JSON"
              language="json"
              value={field.value}
              error={getJsonError(field.value)}
              onChange={field.onChange}
            />
          )}
        />
      </AgenticWorkflowSettingsCard>
      <section className="px-5">
        <Controller
          name="agentPrompt"
          control={form.control}
          render={({ field, fieldState }) => (
            <AgenticWorkflowPromptEditor
              compact
              prompt={field.value}
              promptError={fieldState.isDirty && !field.value.trim() ? 'Please enter instructions.' : undefined}
              variableKeys={[]}
              onPromptChange={field.onChange}
            />
          )}
        />
      </section>
    </>
  )
}
