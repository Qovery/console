import { LlmProviderType, type LlmProviderType as LlmProviderTypeValue } from 'qovery-typescript-axios'
import { useEffect, useRef } from 'react'
import { match } from 'ts-pattern'
import { useLlmProviderModels } from '@qovery/domains/organizations/feature'
import { InputSelect } from '@qovery/shared/ui'

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
  llmProviderId: string
  providerType?: LlmProviderTypeValue
  settings: string
  onChange: (value: string) => void
}

export function AgenticWorkflowModelSetting({
  llmProviderId,
  providerType,
  settings,
  onChange,
}: AgenticWorkflowModelSettingProps) {
  const initializedDefaults = useRef(new Set<string>())
  const activeProviderKey = useRef(`${llmProviderId}:${providerType ?? ''}`)
  const hasLlmProvider = Boolean(llmProviderId)
  const hasModelProvider = hasLlmProvider && Boolean(providerType)
  const {
    data: models = [],
    isError,
    isLoading,
  } = useLlmProviderModels({
    llmProviderId,
    enabled: hasModelProvider,
  })

  const currentModel = getAgenticWorkflowModel(settings)
  const firstModelId = models[0]?.id
  const hasCurrentModel = models.some(({ id }) => id === currentModel)

  useEffect(() => {
    if (!hasModelProvider || !providerType) return

    const initializationKey = `${llmProviderId}:${providerType ?? ''}`
    if (initializedDefaults.current.has(initializationKey)) return

    if (isLoading || isError) return

    if (activeProviderKey.current !== initializationKey) {
      if (!firstModelId) return

      activeProviderKey.current = initializationKey
      initializedDefaults.current.add(initializationKey)
      onChange(updateAgenticWorkflowModel(settings, firstModelId))
      return
    }

    if (hasCurrentModel) {
      initializedDefaults.current.add(initializationKey)
      return
    }

    if (!firstModelId) return

    initializedDefaults.current.add(initializationKey)
    onChange(updateAgenticWorkflowModel(settings, firstModelId))
  }, [
    currentModel,
    firstModelId,
    hasCurrentModel,
    hasModelProvider,
    isError,
    isLoading,
    llmProviderId,
    onChange,
    providerType,
    settings,
  ])

  if (!hasModelProvider) return null

  const modelOptions = models.map(({ id, display_name }) => ({ value: id, label: display_name }))
  const hasModelsError = isError || (!isLoading && models.length === 0)
  const modelsError = match([isError, providerType === LlmProviderType.BEDROCK])
    .with([true, true], () => 'We couldn’t load models. Check this token’s AWS credentials and region.')
    .with([true, false], () => 'We couldn’t load models. Check that this token’s API key is valid.')
    .with(
      [false, true],
      () => 'No models are available in this AWS region. Select another region in the token settings.'
    )
    .with([false, false], () => 'No models are available for this token.')
    .exhaustive()

  return (
    <div className="flex flex-col gap-2">
      <InputSelect
        label="Model"
        value={hasCurrentModel ? currentModel : ''}
        options={modelOptions}
        error={hasModelsError ? modelsError : undefined}
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
