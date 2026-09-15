import {
  type PlatformCloudVendor,
  type PlatformClusterMode,
  type PlatformComponentConfigurationPreviewRequest,
} from 'qovery-typescript-axios'
import { useEffect, useMemo, useState } from 'react'
import { Button, Callout, Icon } from '@qovery/shared/ui'
import { useDebounce } from '@qovery/shared/util-hooks'
import { type CatalogVariableValue, formatCatalogKey } from '@qovery/shared/util-js'
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
  filterPlatformLayerSelections,
  getCurrentPlatformConfigurationPreview,
  getPlatformComponentEditor,
  getTemplateId,
  omitEmptyValues,
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
  const {
    component: selectedComponent,
    configurationComponent,
    isFieldVisible,
  } = getPlatformComponentEditor(selectedTemplate, state?.componentKey)

  // Re-seed when the selected template disappears from the list (e.g. the template
  // version was bumped between refetches, or templates arrived after an empty list).
  useEffect(() => {
    if (selectedTemplate || templates.length === 0) return

    const template =
      templates.find(
        (candidate) => candidate.key === binding?.templateKey && candidate.version === binding.templateVersion
      ) ?? templates[0]
    setState({
      templateId: getTemplateId(template),
      draft: createPlatformConfigurationDraft(template, binding),
    })
  }, [selectedTemplate, templates, binding])

  // profileConfig drives the form display and may contain '' for fields the user
  // explicitly cleared; the resolver request must omit those so a cleared required
  // field surfaces as a violation instead of silently resurrecting its default.
  const { profileConfig, clusterInputs } = useMemo(() => {
    const componentKey = configurationComponent?.key
    return {
      profileConfig: configurationComponent
        ? applyPlatformConfigurationDefaults(
            configurationComponent.fields,
            state && componentKey ? state.draft.managedConfig[componentKey] ?? {} : {}
          )
        : {},
      clusterInputs: state && componentKey ? state.draft.customerProvidedInputs[componentKey] ?? {} : {},
    }
  }, [configurationComponent, state])
  const previewRequest = useMemo<PlatformComponentConfigurationPreviewRequest>(
    () => ({
      profileConfig: omitEmptyValues(profileConfig),
      clusterInputs,
      componentOutputs: {},
    }),
    [profileConfig, clusterInputs]
  )
  const previewQuery = useMemo(
    () => ({ componentKey: configurationComponent?.key, request: previewRequest }),
    [previewRequest, configurationComponent?.key]
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
    enabled: Boolean(configurationComponent) && debouncedPreviewQuery.componentKey === configurationComponent?.key,
  })
  const preview = getCurrentPlatformConfigurationPreview(previewData, configurationComponent?.key, isPreviewPending)

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

  const updateProfileConfig = (fieldKey: string, value: unknown) => {
    if (!configurationComponent) return

    const field = (preview?.fields ?? configurationComponent.fields).find((candidate) => candidate.key === fieldKey)
    if (!field) return

    setState((current) =>
      current
        ? {
            ...current,
            draft: {
              ...current.draft,
              managedConfig: updateComponentValue(
                current.draft.managedConfig,
                configurationComponent.key,
                fieldKey,
                toPlatformConfigurationValue(field, value)
              ),
            },
          }
        : current
    )
  }

  const updateClusterInput = (fieldKey: string, value: CatalogVariableValue) => {
    if (!configurationComponent) return

    setState((current) =>
      current
        ? {
            ...current,
            draft: {
              ...current.draft,
              customerProvidedInputs: updateComponentValue(
                current.draft.customerProvidedInputs,
                configurationComponent.key,
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
      request: {
        ...state.draft,
        layerSelections: filterPlatformLayerSelections(selectedTemplate.layers, state.draft.layerSelections),
        // '' entries are only display markers for cleared fields — never persist them.
        managedConfig: Object.fromEntries(
          Object.entries(state.draft.managedConfig).map(([componentKey, values]) => [
            componentKey,
            omitEmptyValues(values),
          ])
        ),
      },
    })

  const selectComponent = (componentKey: string) => {
    const { configurationComponent: component } = getPlatformComponentEditor(selectedTemplate, componentKey)
    if (!component) return

    setState((current) =>
      current
        ? {
            ...current,
            componentKey,
            draft: {
              ...current.draft,
              managedConfig: {
                ...current.draft.managedConfig,
                // Defaults shown by the editor must also survive saving or navigating back.
                [component.key]: applyPlatformConfigurationDefaults(
                  component.fields,
                  current.draft.managedConfig[component.key] ?? {}
                ),
              },
            },
          }
        : current
    )
  }

  if (!selectedComponent) {
    return (
      <PlatformConfigurationCatalog
        template={selectedTemplate}
        binding={binding}
        clusterMode={clusterMode}
        cloudProvider={cloudProvider}
        layerSelections={state.draft.layerSelections}
        isSaving={isSaving}
        onComponentSelect={selectComponent}
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
        key={selectedComponent.key}
        component={{ ...selectedComponent, fields: configurationComponent?.fields ?? selectedComponent.fields }}
        isFieldVisible={isFieldVisible}
        clusterInputsLocation={
          configurationComponent && configurationComponent.key !== selectedComponent.key
            ? formatCatalogKey(configurationComponent.key)
            : undefined
        }
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
