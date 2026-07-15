import { type PlatformCloudVendor, type PlatformClusterMode } from 'qovery-typescript-axios'
import { useMemo, useState } from 'react'
import { Button, Callout, type CatalogVariableValue, Icon } from '@qovery/shared/ui'
import { useDebounce } from '@qovery/shared/util-hooks'
import { usePlatformBinding } from './hooks/use-platform-binding'
import { usePlatformComponentConfiguration } from './hooks/use-platform-component-configuration'
import { usePlatformTemplates } from './hooks/use-platform-templates'
import { useUpdatePlatformBinding } from './hooks/use-update-platform-binding'
import { PlatformComponentConfiguration } from './platform-component-configuration'
import { PlatformConfigurationCatalog } from './platform-configuration-catalog'
import {
  type PlatformConfigurationDraft,
  applyPlatformConfigurationDefaults,
  createPlatformConfigurationDraft,
  findPlatformComponent,
  getCurrentPlatformConfigurationPreview,
  getTemplateId,
  hasConfigurableFields,
  toPlatformConfigurationValue,
  updateComponentValue,
} from './platform-configuration-utils'

interface PlatformConfigurationProps {
  clusterId: string
  cloudProvider: PlatformCloudVendor
  clusterMode: PlatformClusterMode
  organizationId: string
}

interface PlatformConfigurationState {
  componentKey?: string
  draft: PlatformConfigurationDraft
  templateId: string
}

export function PlatformConfiguration({
  clusterId,
  cloudProvider,
  clusterMode,
  organizationId,
}: PlatformConfigurationProps) {
  const { data: templates = [] } = usePlatformTemplates({
    organizationId,
    clusterMode,
    cloudProvider,
    suspense: true,
  })
  const { data: binding } = usePlatformBinding({ organizationId, clusterId, suspense: true })
  const { mutate: updateBinding, isLoading: isSaving } = useUpdatePlatformBinding()

  const [state, setState] = useState<PlatformConfigurationState | null>(() => {
    const template =
      templates.find(
        (candidate) => candidate.key === binding?.templateKey && candidate.version === binding.templateVersion
      ) ?? templates[0]
    if (!template) return null

    return {
      templateId: getTemplateId(template),
      draft: createPlatformConfigurationDraft(template, binding),
    }
  })

  const selectedTemplate = templates.find((template) => getTemplateId(template) === state?.templateId)
  const selectedComponent = selectedTemplate ? findPlatformComponent(selectedTemplate, state?.componentKey) : undefined
  const previewRequest = useMemo(() => {
    const componentKey = selectedComponent?.key
    const storedProfileConfig = state && componentKey ? state.draft.managedConfig[componentKey] ?? {} : {}
    return {
      profileConfig: selectedComponent
        ? applyPlatformConfigurationDefaults(selectedComponent.fields, storedProfileConfig)
        : {},
      clusterInputs: state && componentKey ? state.draft.customerProvidedInputs[componentKey] ?? {} : {},
      componentOutputs: {},
    }
  }, [selectedComponent, state])
  const { profileConfig, clusterInputs } = previewRequest
  const previewQuery = useMemo(
    () => ({ componentKey: selectedComponent?.key, request: previewRequest }),
    [previewRequest, selectedComponent?.key]
  )
  const debouncedPreviewQuery = useDebounce(previewQuery, 300)
  const isPreviewPending = debouncedPreviewQuery !== previewQuery
  const {
    data: previewData,
    isError: hasPreviewError,
    isFetching,
  } = usePlatformComponentConfiguration({
    organizationId,
    clusterId,
    componentKey: debouncedPreviewQuery.componentKey,
    request: debouncedPreviewQuery.request,
    enabled: hasConfigurableFields(selectedComponent) && debouncedPreviewQuery.componentKey === selectedComponent?.key,
  })
  const preview = getCurrentPlatformConfigurationPreview(previewData, selectedComponent?.key, isPreviewPending)

  if (!state || !selectedTemplate) {
    return (
      <Callout.Root color="neutral">
        <Callout.Icon>
          <Icon iconName="circle-info" iconStyle="regular" />
        </Callout.Icon>
        <Callout.Text>No platform template is available for this organization.</Callout.Text>
      </Callout.Root>
    )
  }

  const updateProfileConfig = (fieldKey: string, value: CatalogVariableValue) => {
    if (!selectedComponent) return

    const field = (preview?.fields ?? selectedComponent.fields).find((candidate) => candidate.key === fieldKey)
    if (!field) return

    setState((current) =>
      current
        ? {
            ...current,
            draft: {
              ...current.draft,
              managedConfig: updateComponentValue(
                current.draft.managedConfig,
                selectedComponent.key,
                fieldKey,
                toPlatformConfigurationValue(field, value)
              ),
            },
          }
        : current
    )
  }

  const updateClusterInput = (fieldKey: string, value: CatalogVariableValue) => {
    if (!selectedComponent) return

    setState((current) =>
      current
        ? {
            ...current,
            draft: {
              ...current.draft,
              customerProvidedInputs: updateComponentValue(
                current.draft.customerProvidedInputs,
                selectedComponent.key,
                fieldKey,
                String(value)
              ),
            },
          }
        : current
    )
  }

  const saveConfiguration = () =>
    updateBinding({
      organizationId,
      clusterId,
      request: state.draft,
    })

  if (!selectedComponent) {
    return (
      <PlatformConfigurationCatalog
        template={selectedTemplate}
        binding={binding}
        clusterMode={clusterMode}
        cloudProvider={cloudProvider}
        layerSelections={state.draft.layerSelections}
        isSaving={isSaving}
        onComponentSelect={(componentKey) => setState((current) => (current ? { ...current, componentKey } : current))}
        onLayerSelectionChange={(layerKey, enabled) =>
          setState((current) =>
            current
              ? {
                  ...current,
                  draft: {
                    ...current.draft,
                    layerSelections: { ...current.draft.layerSelections, [layerKey]: enabled },
                  },
                }
              : current
          )
        }
        onSave={saveConfiguration}
      />
    )
  }

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <Button
        type="button"
        variant="plain"
        color="neutral"
        className="w-fit gap-2 text-neutral-subtle hover:text-neutral"
        onClick={() => setState((current) => (current ? { ...current, componentKey: undefined } : current))}
      >
        <Icon iconName="arrow-left" />
        Platform layers
      </Button>
      <PlatformComponentConfiguration
        component={selectedComponent}
        preview={preview}
        profileConfig={profileConfig}
        clusterInputs={clusterInputs}
        hasPreviewError={hasPreviewError}
        isFetching={isFetching || isPreviewPending}
        isSaving={isSaving}
        onProfileConfigChange={updateProfileConfig}
        onClusterInputChange={updateClusterInput}
        onSave={saveConfiguration}
      />
    </div>
  )
}
