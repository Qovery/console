import { type ClusterPlatformBindingRequest } from 'qovery-typescript-axios'
import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Callout,
  type CatalogVariableValue,
  FunnelFlowBody,
  Icon,
  LoaderSpinner,
  Section,
} from '@qovery/shared/ui'
import { useDebounce } from '@qovery/shared/util-hooks'
import { usePlatformTemplateComponentConfiguration } from '../../platform-configuration/hooks/use-platform-template-component-configuration'
import { usePlatformTemplates } from '../../platform-configuration/hooks/use-platform-templates'
import { PlatformComponentConfiguration } from '../../platform-configuration/platform-component-configuration'
import { PlatformConfigurationCatalog } from '../../platform-configuration/platform-configuration-catalog'
import {
  applyPlatformConfigurationDefaults,
  createPlatformConfigurationDraft,
  findPlatformComponent,
  getCurrentPlatformConfigurationPreview,
  toPlatformCloudVendor,
  toPlatformConfigurationValue,
} from '../../platform-configuration/platform-configuration-utils'
import { steps, useClusterContainerCreateContext } from '../cluster-creation-flow'

interface StepPlatformProps {
  organizationId: string
  onPrevious: () => void
  onSubmit: () => void
}

interface ComponentDraft {
  componentKey: string
  managedConfig: Record<string, unknown>
  clusterInputs: Record<string, string>
}

export function StepPlatform({ organizationId, onPrevious, onSubmit }: StepPlatformProps) {
  const [componentDraft, setComponentDraft] = useState<ComponentDraft>()
  const {
    generalData,
    platformConfigurationData,
    setCurrentStep,
    setPlatformConfigurationData,
    isEngineV2SelfManaged,
  } = useClusterContainerCreateContext()
  const cloudProvider = toPlatformCloudVendor(generalData?.cloud_provider)
  const {
    data: templates = [],
    isLoading,
    isError,
  } = usePlatformTemplates({
    organizationId,
    clusterMode: cloudProvider ? 'CUSTOMER_MANAGED' : undefined,
    cloudProvider,
  })
  const template =
    templates.find(
      (candidate) =>
        candidate.key === platformConfigurationData?.templateKey &&
        candidate.version === platformConfigurationData.templateVersion
    ) ?? templates[0]
  const draft = template
    ? platformConfigurationData?.templateKey === template.key &&
      platformConfigurationData.templateVersion === template.version
      ? platformConfigurationData
      : createPlatformConfigurationDraft(template, null)
    : undefined
  const selectedComponent = template ? findPlatformComponent(template, componentDraft?.componentKey) : undefined
  const previewRequest = useMemo(
    () => ({
      profileConfig: selectedComponent
        ? applyPlatformConfigurationDefaults(selectedComponent.fields, componentDraft?.managedConfig ?? {})
        : {},
      clusterInputs: componentDraft?.clusterInputs ?? {},
      componentOutputs: {},
    }),
    [componentDraft?.clusterInputs, componentDraft?.managedConfig, selectedComponent]
  )
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
  } = usePlatformTemplateComponentConfiguration({
    organizationId,
    templateKey: template?.key,
    templateVersion: template?.version,
    componentKey: debouncedPreviewQuery.componentKey,
    clusterMode: 'CUSTOMER_MANAGED',
    cloudProvider,
    request: debouncedPreviewQuery.request,
    enabled: Boolean(selectedComponent) && debouncedPreviewQuery.componentKey === selectedComponent?.key,
  })
  const preview = getCurrentPlatformConfigurationPreview(previewData, selectedComponent?.key, isPreviewPending)

  useEffect(() => {
    const stepIndex = steps(generalData, isEngineV2SelfManaged).findIndex((step) => step.key === 'platform') + 1
    if (stepIndex > 0) setCurrentStep(stepIndex)
  }, [generalData, isEngineV2SelfManaged, setCurrentStep])

  const updateDraft = (update: (current: ClusterPlatformBindingRequest) => ClusterPlatformBindingRequest) => {
    if (!draft || !setPlatformConfigurationData) return
    setPlatformConfigurationData(update(draft))
  }

  const handleSubmit = () => {
    if (!draft || !setPlatformConfigurationData) return
    setPlatformConfigurationData(draft)
    onSubmit()
  }

  const updateProfileConfig = (fieldKey: string, value: CatalogVariableValue) => {
    if (!selectedComponent || !componentDraft) return

    const field = (preview?.fields ?? selectedComponent.fields).find((candidate) => candidate.key === fieldKey)
    if (!field) return

    const fieldValue = toPlatformConfigurationValue(field, value)
    setComponentDraft((current) => {
      if (!current) return current

      const managedConfig = { ...current.managedConfig }
      if (fieldValue === undefined) {
        delete managedConfig[fieldKey]
      } else {
        managedConfig[fieldKey] = fieldValue
      }
      return { ...current, managedConfig }
    })
  }

  const updateClusterInput = (fieldKey: string, value: CatalogVariableValue) => {
    if (!componentDraft) return

    setComponentDraft((current) => {
      if (!current) return current

      const nextClusterInputs = { ...current.clusterInputs }
      if (value === undefined) {
        delete nextClusterInputs[fieldKey]
      } else {
        nextClusterInputs[fieldKey] = String(value)
      }
      return { ...current, clusterInputs: nextClusterInputs }
    })
  }

  const saveComponentConfiguration = () => {
    if (!componentDraft || !preview) return

    const activeClusterInputs: Record<string, string> = Object.fromEntries(
      preview.requirements.flatMap((requirement) => {
        const value = componentDraft.clusterInputs[requirement.key]
        return value === undefined ? [] : [[requirement.key, value] as const]
      })
    )

    updateDraft((current) => {
      const customerProvidedInputs = { ...current.customerProvidedInputs }
      if (Object.keys(activeClusterInputs).length > 0) {
        customerProvidedInputs[componentDraft.componentKey] = activeClusterInputs
      } else {
        delete customerProvidedInputs[componentDraft.componentKey]
      }

      return {
        ...current,
        managedConfig: {
          ...current.managedConfig,
          [componentDraft.componentKey]: componentDraft.managedConfig,
        },
        customerProvidedInputs,
      }
    })
    setComponentDraft(undefined)
  }

  return (
    <FunnelFlowBody>
      <Section>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <LoaderSpinner className="w-4" />
          </div>
        ) : isError ? (
          <Callout.Root color="red">
            <Callout.Icon>
              <Icon iconName="circle-exclamation" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>Platform layers could not be loaded. Please try again.</Callout.Text>
          </Callout.Root>
        ) : template && draft && selectedComponent ? (
          <div className="flex max-w-3xl flex-col gap-4">
            <Button
              type="button"
              variant="plain"
              color="neutral"
              className="w-fit gap-2 text-neutral-subtle hover:text-neutral"
              onClick={() => setComponentDraft(undefined)}
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
              isSaving={false}
              onProfileConfigChange={updateProfileConfig}
              onClusterInputChange={updateClusterInput}
              onSave={saveComponentConfiguration}
            />
          </div>
        ) : template && draft ? (
          <PlatformConfigurationCatalog
            template={template}
            binding={null}
            clusterMode="CUSTOMER_MANAGED"
            cloudProvider={cloudProvider}
            layerSelections={draft.layerSelections ?? {}}
            description="Choose the platform layers that the Qovery operator will install on this cluster."
            isSaving={false}
            onComponentSelect={(componentKey) =>
              setComponentDraft({
                componentKey,
                managedConfig: { ...draft.managedConfig?.[componentKey] },
                clusterInputs: { ...draft.customerProvidedInputs?.[componentKey] },
              })
            }
            onLayerSelectionChange={(layerKey, enabled) =>
              updateDraft((current) => ({
                ...current,
                layerSelections: { ...current.layerSelections, [layerKey]: enabled },
              }))
            }
            onPrevious={onPrevious}
            onSave={handleSubmit}
            saveLabel="Continue"
          />
        ) : (
          <Callout.Root color="neutral">
            <Callout.Icon>
              <Icon iconName="circle-info" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>No platform template is available for this organization.</Callout.Text>
          </Callout.Root>
        )}
      </Section>
    </FunnelFlowBody>
  )
}

export default StepPlatform
