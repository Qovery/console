import { LlmProviderType, type LlmProviderType as LlmProviderTypeValue } from 'qovery-typescript-axios'
import { type ReactNode, useEffect, useRef } from 'react'
import { useLlmProviderModels } from '@qovery/domains/organizations/feature'
import { InputSelect } from '@qovery/shared/ui'

const DEFAULT_BEDROCK_MODEL = 'eu.anthropic.claude-opus-5'

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
  const initializedDefaults = useRef(new Set<string>())
  const hasLlmProvider = Boolean(llmProviderId)
  const isClaude = hasLlmProvider && providerType === LlmProviderType.CLAUDE
  const {
    data: models = [],
    isError,
    isLoading,
  } = useLlmProviderModels({
    llmProviderId,
    enabled: isClaude,
  })

  const parsedSettings = parseModelSettings(settings)
  const currentModel = getAgenticWorkflowModel(settings)
  const firstModelId = models[0]?.id
  const hasInvalidSettings = Boolean(settings.trim()) && !parsedSettings

  useEffect(() => {
    if (!hasLlmProvider || !providerType) return

    const initializationKey = `${llmProviderId}:${providerType}`
    if (initializedDefaults.current.has(initializationKey)) return

    if (currentModel || hasInvalidSettings) {
      initializedDefaults.current.add(initializationKey)
      return
    }

    if (isClaude && firstModelId) {
      initializedDefaults.current.add(initializationKey)
      onChange(updateAgenticWorkflowModel(settings, firstModelId))
    } else if (providerType === LlmProviderType.BEDROCK) {
      initializedDefaults.current.add(initializationKey)
      onChange(updateAgenticWorkflowModel(settings, DEFAULT_BEDROCK_MODEL))
    }
  }, [
    currentModel,
    firstModelId,
    hasInvalidSettings,
    hasLlmProvider,
    isClaude,
    llmProviderId,
    onChange,
    providerType,
    settings,
  ])

  if (!hasLlmProvider) return null
  if (!isClaude) return bedrockSettings

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
        portal
        placeholder="Select a model"
        onChange={(nextValue) => {
          if (typeof nextValue === 'string') onChange(updateAgenticWorkflowModel(settings, nextValue))
        }}
      />
    </div>
  )
}
