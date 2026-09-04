import { Controller, type UseFormReturn } from 'react-hook-form'
import { AgenticWorkflowCodeEditorField, AgenticWorkflowPromptEditor } from '@qovery/domains/services/feature'
import { InputText } from '@qovery/shared/ui'
import { AgenticWorkflowSettingsCard } from '../agentic-workflow-settings-card'
import { type AgenticWorkflowSettingsFormValues } from '../agentic-workflow-settings.types'

export function AgenticWorkflowAiConfigurationSettings({
  environmentId,
  form,
}: {
  environmentId: string
  form: UseFormReturn<AgenticWorkflowSettingsFormValues>
}) {
  const agentPrompt = form.watch('agentPrompt')
  const modelSettings = form.watch('modelSettings')
  let modelSettingsError: string | undefined

  try {
    JSON.parse(modelSettings)
  } catch {
    modelSettingsError = 'Invalid JSON format.'
  }

  return (
    <>
      <AgenticWorkflowSettingsCard
        title="Provider"
        description="Configure the Anthropic credentials and cloud settings."
      >
        <Controller
          name="modelApiKey"
          control={form.control}
          render={({ field }) => (
            <InputText {...field} type="password" label="API key" hint="Leave empty to keep the current API key." />
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
              error={modelSettingsError}
              onChange={field.onChange}
            />
          )}
        />
      </AgenticWorkflowSettingsCard>
      <section className="px-5">
        <AgenticWorkflowPromptEditor
          environmentId={environmentId}
          prompt={agentPrompt}
          variableKeys={[]}
          onPromptChange={(value) => form.setValue('agentPrompt', value, { shouldDirty: true })}
        />
      </section>
    </>
  )
}
