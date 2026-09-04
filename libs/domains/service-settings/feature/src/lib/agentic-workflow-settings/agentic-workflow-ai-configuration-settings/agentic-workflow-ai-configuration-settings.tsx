import { Controller, type UseFormReturn } from 'react-hook-form'
import { AgenticWorkflowCodeEditorField, AgenticWorkflowPromptEditor } from '@qovery/domains/services/feature'
import { InputText } from '@qovery/shared/ui'
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
  environmentId,
  form,
}: {
  environmentId: string
  form: UseFormReturn<AgenticWorkflowSettingsFormValues>
}) {
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
              environmentId={environmentId}
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
