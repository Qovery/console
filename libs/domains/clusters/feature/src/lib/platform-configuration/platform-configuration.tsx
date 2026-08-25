import { type PlatformCloudVendor, type PlatformClusterMode } from 'qovery-typescript-axios'
import { useEffect, useMemo, useState } from 'react'
import { Button, Callout, Icon } from '@qovery/shared/ui'
import { useDebounce } from '@qovery/shared/util-hooks'
import { type CatalogVariableValue } from '@qovery/shared/util-js'
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
  const selectedComponent = selectedTemplate ? findPlatformComponent(selectedTemplate, state?.componentKey) : undefined

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
    const componentKey = selectedComponent?.key
    return {
      profileConfig: selectedComponent
        ? applyPlatformConfigurationDefaults(
            selectedComponent.fields,
            state && componentKey ? state.draft.managedConfig[componentKey] ?? {} : {}
          )
        : {},
      clusterInputs: state && componentKey ? state.draft.customerProvidedInputs[componentKey] ?? {} : {},
    }
  }, [selectedComponent, state])
  const previewRequest = useMemo(
    () => ({
      profileConfig: omitEmptyValues(profileConfig),
      clusterInputs,
      componentOutputs: {},
    }),
    [profileConfig, clusterInputs]
  )
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
    enabled: Boolean(selectedComponent) && debouncedPreviewQuery.componentKey === selectedComponent?.key,
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
      request: {
        ...state.draft,
        // '' entries are only display markers for cleared fields — never persist them.
        managedConfig: Object.fromEntries(
          Object.entries(state.draft.managedConfig).map(([componentKey, values]) => [
            componentKey,
            omitEmptyValues(values),
          ])
        ),
      },
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
