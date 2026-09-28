import { type AgenticWorkflowModelType, type LlmProviderResponse } from 'qovery-typescript-axios'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { LlmProviderSetting } from '@qovery/domains/organizations/feature'
import { AgenticWorkflowModelSetting, AgenticWorkflowPromptEditor } from '@qovery/domains/services/feature'
import { type AgenticWorkflowSettingsFormValues } from '../agentic-workflow-settings'
import { AgenticWorkflowSettingsCard } from '../agentic-workflow-settings-card'

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
  const currentModelType = form.watch('modelType')
  const providerRegion = llmProviders.find(({ id }) => id === llmProviderId)?.region

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
            <LlmProviderSetting
              llmProviders={llmProviders}
              value={field.value}
              onChange={(providerId, llmProvider) => {
                field.onChange(providerId)
                const provider = llmProvider ?? llmProviders.find(({ id }) => id === providerId)
                if (provider) {
                  form.setValue('modelType', provider.type as AgenticWorkflowModelType, { shouldDirty: true })
                }
              }}
            />
          )}
        />
        <Controller
          name="modelSettings"
          control={form.control}
          render={({ field }) => (
            <AgenticWorkflowModelSetting
              llmProviderId={llmProviderId}
              providerType={currentModelType ?? modelType}
              providerRegion={providerRegion}
              settings={field.value}
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
