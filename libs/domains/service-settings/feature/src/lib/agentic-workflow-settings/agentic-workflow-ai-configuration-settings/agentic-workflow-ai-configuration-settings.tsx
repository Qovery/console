import { type AgenticWorkflowModelType, type LlmProviderResponse } from 'qovery-typescript-axios'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { LlmProviderSetting } from '@qovery/domains/organizations/feature'
import {
  AgenticWorkflowCodeEditorField,
  AgenticWorkflowModelSetting,
  AgenticWorkflowPromptEditor,
} from '@qovery/domains/services/feature'
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
  modelType,
}: {
  form: UseFormReturn<AgenticWorkflowSettingsFormValues>
  llmProviders: LlmProviderResponse[]
  modelType: AgenticWorkflowModelType
}) {
  const llmProviderId = form.watch('llmProviderId')
  const selectedProvider = llmProviders.find(({ id }) => id === llmProviderId)

  return (
    <>
      <AgenticWorkflowSettingsCard
        title="Provider"
        description="Configure the model provider token and model settings."
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
            <AgenticWorkflowModelSetting
              llmProviderId={llmProviderId}
              providerType={selectedProvider?.type ?? modelType}
              settings={field.value}
              onChange={field.onChange}
              bedrockSettings={
                <AgenticWorkflowCodeEditorField
                  name={field.name}
                  label="Cloud settings JSON"
                  language="json"
                  value={field.value}
                  error={getJsonError(field.value)}
                  placeholder={'{\n  "model": "eu.anthropic.claude-opus-5"\n}'}
                  onChange={field.onChange}
                />
              }
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
