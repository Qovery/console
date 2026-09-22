import {
  type PlatformCloudVendor,
  type PlatformClusterMode,
  type PlatformComponentConfigurationPreviewRequest,
} from 'qovery-typescript-axios'
import { useEffect, useMemo, useState } from 'react'
import { Button, Callout, Icon } from '@qovery/shared/ui'
import { useDebounce } from '@qovery/shared/util-hooks'
import { type CatalogVariableValue, formatCatalogKey } from '@qovery/shared/util-js'
import { ClusterOperatorStatus } from './cluster-operator-status'
import { useClusterPlatformConfiguration } from './hooks/use-cluster-platform-configuration'
import { usePlatformComponentConfiguration } from './hooks/use-platform-component-configuration'
import { usePlatformTemplates } from './hooks/use-platform-templates'
import { useUpdateClusterPlatformConfiguration } from './hooks/use-update-cluster-platform-configuration'
import { PlatformComponentConfiguration } from './platform-component-configuration'
import { PlatformConfigurationCatalog } from './platform-configuration-catalog'
import {
  type PlatformConfigurationDraft,
  applyPlatformConfigurationDefaults,
  clearRedactedValues,
  createPlatformConfigurationDraft,
  filterPlatformLayerSelections,
  findPlatformComponent,
  getCurrentPlatformConfigurationPreview,
  getPlatformComponentEditor,
  getRedactedComponentKeys,
  getRedactedFieldKeys,
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
  sourceComponentKey?: string
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
  const { data: configuration } = useClusterPlatformConfiguration({ clusterId, suspense: true })
  const { mutate: updateConfiguration, isLoading: isSaving } = useUpdateClusterPlatformConfiguration()

  const [state, setState] = useState<PlatformConfigurationState | null>(() => {
    const template =
      templates.find(
        (candidate) =>
          candidate.key === configuration?.platform.templateKey &&
          candidate.version === configuration.platform.templateVersion
      ) ?? templates[0]
    if (!template) return null

    return {
      templateId: getTemplateId(template),
      draft: createPlatformConfigurationDraft(template, configuration),
    }
  })

  const selectedTemplate = templates.find((template) => getTemplateId(template) === state?.templateId)
  const {
    component: selectedComponent,
    configurationComponent,
    isFieldVisible,
    sections,
  } = getPlatformComponentEditor(selectedTemplate, state?.componentKey, state?.sourceComponentKey)

  // Re-seed when the selected template disappears from the list (e.g. the template
  // version was bumped between refetches, or templates arrived after an empty list).
  useEffect(() => {
    if (selectedTemplate || templates.length === 0) return

    const template =
      templates.find(
        (candidate) =>
          candidate.key === configuration?.platform.templateKey &&
          candidate.version === configuration.platform.templateVersion
      ) ?? templates[0]
    setState({
      templateId: getTemplateId(template),
      draft: createPlatformConfigurationDraft(template, configuration),
    })
  }, [selectedTemplate, templates, configuration])

  // profileConfig drives the form display and may contain '' for fields the user
  // explicitly cleared; the resolver request must omit those so a cleared required
  // field surfaces as a violation instead of silently resurrecting its default.
  const { profileConfig, clusterInputs } = useMemo(() => {
    const componentKey = configurationComponent?.key
    return {
      profileConfig: configurationComponent
        ? applyPlatformConfigurationDefaults(
            configurationComponent.fields,
            clearRedactedValues(state && componentKey ? state.draft.platform.managedConfig[componentKey] ?? {} : {})
          )
        : {},
      clusterInputs: state && componentKey ? state.draft.clusterInputs[componentKey] ?? {} : {},
    }
  }, [configurationComponent, state])
  const previewRequest = useMemo<PlatformComponentConfigurationPreviewRequest>(
    () => ({
      profileConfig: omitEmptyValues(profileConfig, configurationComponent?.fields),
      replaceProfileConfig: true,
      clusterInputs,
      componentOutputs: {},
    }),
    [profileConfig, clusterInputs, configurationComponent?.fields]
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
              platform: {
                ...current.draft.platform,
                managedConfig: updateComponentValue(
                  current.draft.platform.managedConfig,
                  configurationComponent.key,
                  fieldKey,
                  toPlatformConfigurationValue(field, value)
                ),
              },
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
              clusterInputs: updateComponentValue(
                current.draft.clusterInputs,
                configurationComponent.key,
                fieldKey,
                String(value)
              ),
            },
          }
        : current
    )
  }

  const bootstrapComponent = selectedTemplate.bootstrapComponent
  const redactedComponentKeys = getRedactedComponentKeys(state.draft.platform.managedConfig)
  const saveConfiguration = () => {
    if (redactedComponentKeys.length > 0) return
    updateConfiguration({
      clusterId,
      request: {
        ...state.draft,
        platform: {
          ...state.draft.platform,
          layerSelections: filterPlatformLayerSelections(selectedTemplate.layers, state.draft.platform.layerSelections),
          // Remove cleared fields while preserving required empty values allowed by their schema.
          managedConfig: Object.fromEntries(
            Object.entries(state.draft.platform.managedConfig).map(([componentKey, values]) => [
              componentKey,
              omitEmptyValues(values, findPlatformComponent(selectedTemplate, componentKey)?.fields),
            ])
          ),
        },
      },
    })
  }

  const selectComponent = (componentKey: string, sourceComponentKey?: string) => {
    const { configurationComponent: component } = getPlatformComponentEditor(
      selectedTemplate,
      componentKey,
      sourceComponentKey
    )
    if (!component) return

    setState((current) =>
      current
        ? {
            ...current,
            componentKey,
            sourceComponentKey: component.key,
            draft: {
              ...current.draft,
              platform: {
                ...current.draft.platform,
                managedConfig: {
                  ...current.draft.platform.managedConfig,
                  // Defaults shown by the editor must also survive saving or navigating back.
                  [component.key]: applyPlatformConfigurationDefaults(
                    component.fields,
                    current.draft.platform.managedConfig[component.key] ?? {}
                  ),
                },
              },
            },
          }
        : current
    )
  }

  if (!selectedComponent) {
    return (
      <PlatformConfigurationCatalog
        bootstrapContent={
          clusterMode === 'CUSTOMER_MANAGED' ? (
            <ClusterOperatorStatus
              organizationId={organizationId}
              clusterId={clusterId}
              onConfigure={bootstrapComponent ? () => selectComponent(bootstrapComponent.key) : undefined}
            />
          ) : undefined
        }
        template={selectedTemplate}
        configuration={configuration}
        clusterMode={clusterMode}
        cloudProvider={cloudProvider}
        layerSelections={state.draft.platform.layerSelections}
        isSaving={isSaving}
        redactedComponentKeys={redactedComponentKeys}
        onComponentSelect={selectComponent}
        onLayerSelectionChange={(layerKey, enabled) =>
          setState((current) =>
            current
              ? {
                  ...current,
                  draft: {
                    ...current.draft,
                    platform: {
                      ...current.draft.platform,
                      layerSelections: { ...current.draft.platform.layerSelections, [layerKey]: enabled },
                    },
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
      {sections.length > 1 && (
        <div className="flex flex-wrap gap-2" aria-label="Configuration sections">
          {sections.map((section) => (
            <Button
              key={section.configurationComponent.key}
              type="button"
              variant="outline"
              color="neutral"
              aria-pressed={configurationComponent?.key === section.configurationComponent.key}
              onClick={() => selectComponent(selectedComponent.key, section.configurationComponent.key)}
            >
              {section.label}
            </Button>
          ))}
        </div>
      )}
      {selectedComponent.key === selectedTemplate.bootstrapComponent?.key && (
        <Callout.Root color="sky">
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            Save these settings, then use Update Operator to apply them. Saving does not update the running Operator.
          </Callout.Text>
        </Callout.Root>
      )}
      <PlatformComponentConfiguration
        key={`${selectedComponent.key}/${configurationComponent?.key}`}
        component={{ ...selectedComponent, fields: configurationComponent?.fields ?? selectedComponent.fields }}
        isFieldVisible={isFieldVisible}
        clusterInputsLocation={
          configurationComponent && configurationComponent.key !== selectedComponent.key
            ? formatCatalogKey(configurationComponent.key)
            : undefined
        }
        preview={preview}
        profileConfig={profileConfig}
        redactedComponentKeys={redactedComponentKeys}
        redactedFieldKeys={getRedactedFieldKeys(
          configurationComponent && state.draft.platform.managedConfig[configurationComponent.key]
        )}
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
