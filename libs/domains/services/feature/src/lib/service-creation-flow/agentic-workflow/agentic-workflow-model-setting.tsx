import { LlmProviderType, type LlmProviderType as LlmProviderTypeValue } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { useLlmProviderModels } from '@qovery/domains/organizations/feature'
import { Button, InputSelect } from '@qovery/shared/ui'

function parseModelSettings(value: string): Record<string, unknown> | undefined {
  try {
    const settings: unknown = JSON.parse(value)
    return settings && typeof settings === 'object' && !Array.isArray(settings)
      ? (settings as Record<string, unknown>)
      : undefined
  } catch {
    return undefined
  }
}

export function getAgenticWorkflowModel(value: string) {
  const model = parseModelSettings(value)?.['model']
  return typeof model === 'string' ? model : ''
}

export function updateAgenticWorkflowModel(value: string, model: string) {
  const settings = parseModelSettings(value) ?? {}
  return JSON.stringify({ ...settings, model }, null, 2)
}

export interface AgenticWorkflowModelSettingProps {
  bedrockSettings: ReactNode
  llmProviderId: string
  providerType?: LlmProviderTypeValue
  settings: string
  onChange: (value: string) => void
}

export function AgenticWorkflowModelSetting({
  bedrockSettings,
  llmProviderId,
  providerType,
  settings,
  onChange,
}: AgenticWorkflowModelSettingProps) {
  const hasLlmProvider = Boolean(llmProviderId)
  const isClaude = hasLlmProvider && providerType === LlmProviderType.CLAUDE
  const {
    data: models = [],
    isError,
    isLoading,
    refetch,
  } = useLlmProviderModels({
    llmProviderId,
    enabled: isClaude,
  })

  if (!hasLlmProvider) return null
  if (!isClaude) return bedrockSettings

  const currentModel = getAgenticWorkflowModel(settings)
  const modelOptions = models.map(({ id, display_name }) => ({ value: id, label: display_name }))
  const options =
    currentModel && !models.some(({ id }) => id === currentModel)
      ? [{ value: currentModel, label: currentModel }, ...modelOptions]
      : modelOptions

  return (
    <div className="flex flex-col gap-2">
      <InputSelect
        label="Model"
        value={currentModel}
        options={options}
        error={isError ? 'Unable to load models.' : undefined}
        hint={!isLoading && !isError && models.length === 0 ? 'No model is available for this token.' : undefined}
        isLoading={isLoading}
        isSearchable
        placeholder="Select a model"
        onChange={(nextValue) => {
          if (typeof nextValue === 'string') onChange(updateAgenticWorkflowModel(settings, nextValue))
        }}
      />
      {isError ? (
        <div>
          <Button type="button" size="sm" variant="outline" color="neutral" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  )
}
