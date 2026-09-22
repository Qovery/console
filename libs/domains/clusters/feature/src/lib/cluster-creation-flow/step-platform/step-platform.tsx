import {
  type ClusterPlatformBindingRequest,
  type PlatformComponentConfigurationPreviewRequest,
} from 'qovery-typescript-axios'
import { useEffect, useMemo, useState } from 'react'
import { Button, Callout, FunnelFlowBody, Icon, LoaderSpinner, Section } from '@qovery/shared/ui'
import { useDebounce } from '@qovery/shared/util-hooks'
import { type CatalogVariableValue, formatCatalogKey } from '@qovery/shared/util-js'
import { usePlatformTemplateComponentConfiguration } from '../../platform-configuration/hooks/use-platform-template-component-configuration'
import { usePlatformTemplates } from '../../platform-configuration/hooks/use-platform-templates'
import { PlatformComponentConfiguration } from '../../platform-configuration/platform-component-configuration'
import { PlatformConfigurationCatalog } from '../../platform-configuration/platform-configuration-catalog'
import {
  applyPlatformConfigurationDefaults,
  createPlatformConfigurationDraft,
  findPlatformComponent,
  getCurrentPlatformConfigurationPreview,
  getPlatformComponentEditor,
  omitEmptyValues,
  toPlatformCloudVendor,
  toPlatformConfigurationValue,
} from '../../platform-configuration/platform-configuration-utils'
import { steps, useClusterContainerCreateContext } from '../cluster-creation-flow'

interface StepPlatformProps {
  organizationId: string
  onPrevious: () => void
  onSubmit: () => void
}

interface ComponentValues {
  managedConfig: NonNullable<PlatformComponentConfigurationPreviewRequest['profileConfig']>
  clusterInputs: NonNullable<PlatformComponentConfigurationPreviewRequest['clusterInputs']>
}

interface ComponentDraft extends ComponentValues {
  componentKey: string
  sourceComponentKey: string
  pendingConfigurations: Record<string, ComponentValues>
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
  const {
    component: selectedComponent,
    configurationComponent,
    isFieldVisible,
    sections,
  } = getPlatformComponentEditor(template, componentDraft?.componentKey, componentDraft?.sourceComponentKey)
  // profileConfig drives the form display and may contain '' for fields the user
  // explicitly cleared; the resolver request must omit those so a cleared required
  // field surfaces as a violation instead of silently resurrecting its default.
  const { profileConfig, clusterInputs } = useMemo(
    () => ({
      profileConfig: configurationComponent
        ? applyPlatformConfigurationDefaults(configurationComponent.fields, componentDraft?.managedConfig ?? {})
        : {},
      clusterInputs: componentDraft?.clusterInputs ?? {},
    }),
    [componentDraft?.clusterInputs, componentDraft?.managedConfig, configurationComponent]
  )
  const previewRequest = useMemo<PlatformComponentConfigurationPreviewRequest>(
    () => ({
      profileConfig: omitEmptyValues(profileConfig, configurationComponent?.fields),
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
  } = usePlatformTemplateComponentConfiguration({
    organizationId,
    templateKey: template?.key,
    templateVersion: template?.version,
    componentKey: debouncedPreviewQuery.componentKey,
    clusterMode: 'CUSTOMER_MANAGED',
    cloudProvider,
    request: debouncedPreviewQuery.request,
    enabled: Boolean(configurationComponent) && debouncedPreviewQuery.componentKey === configurationComponent?.key,
  })
  const preview = getCurrentPlatformConfigurationPreview(previewData, configurationComponent?.key, isPreviewPending)

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

  const updateProfileConfig = (fieldKey: string, value: unknown) => {
    if (!configurationComponent || !componentDraft) return

    const field = (preview?.fields ?? configurationComponent.fields).find((candidate) => candidate.key === fieldKey)
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
    if (!componentDraft || !preview || !configurationComponent) return

    const activeClusterInputs: Record<string, string> = Object.fromEntries(
      preview.requirements.flatMap((requirement) => {
        const value = componentDraft.clusterInputs[requirement.key]
        return value === undefined ? [] : [[requirement.key, value] as const]
      })
    )

    updateDraft((current) => {
      const customerProvidedInputs = { ...current.customerProvidedInputs }
      const managedConfig = { ...current.managedConfig }
      Object.entries(componentDraft.pendingConfigurations).forEach(([key, values]) => {
        managedConfig[key] = omitEmptyValues(
          values.managedConfig,
          template ? findPlatformComponent(template, key)?.fields : undefined
        )
        customerProvidedInputs[key] = values.clusterInputs
      })
      if (Object.keys(activeClusterInputs).length > 0) {
        customerProvidedInputs[configurationComponent.key] = activeClusterInputs
      } else {
        delete customerProvidedInputs[configurationComponent.key]
      }

      return {
        ...current,
        managedConfig: {
          ...managedConfig,
          // Preserve required empty values such as valueless tolerations.
          [configurationComponent.key]: omitEmptyValues(componentDraft.managedConfig, configurationComponent.fields),
        },
        customerProvidedInputs,
      }
    })
    setComponentDraft(undefined)
  }

  const selectComponent = (componentKey: string, sourceComponentKey?: string) => {
    if (!draft) return
    const { configurationComponent: owner } = getPlatformComponentEditor(template, componentKey, sourceComponentKey)
    if (!owner) return
    const pendingConfigurations =
      componentDraft?.componentKey === componentKey
        ? {
            ...componentDraft.pendingConfigurations,
            [componentDraft.sourceComponentKey]: { managedConfig: profileConfig, clusterInputs },
          }
        : {}
    const values = pendingConfigurations[owner.key]
    setComponentDraft({
      componentKey,
      sourceComponentKey: owner.key,
      pendingConfigurations,
      managedConfig: values?.managedConfig ?? { ...draft.managedConfig?.[owner.key] },
      clusterInputs: values?.clusterInputs ?? { ...draft.customerProvidedInputs?.[owner.key] },
    })
  }

  return (
    <FunnelFlowBody>
      <Section>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <LoaderSpinner className="w-4" />
          </div>
        ) : isError ? (
          <div className="flex max-w-4xl flex-col gap-6">
            <Callout.Root color="red">
              <Callout.Icon>
                <Icon iconName="circle-exclamation" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>Platform layers could not be loaded. Please try again.</Callout.Text>
            </Callout.Root>
            <div className="flex justify-between border-t border-neutral pt-4">
              <Button type="button" size="lg" color="neutral" variant="plain" onClick={onPrevious}>
                Back
              </Button>
            </div>
          </div>
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
            onComponentSelect={selectComponent}
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
          <div className="flex max-w-4xl flex-col gap-6">
            <Callout.Root color="neutral">
              <Callout.Icon>
                <Icon iconName="circle-info" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>No platform template is available for this organization.</Callout.Text>
            </Callout.Root>
            <div className="flex justify-between border-t border-neutral pt-4">
              <Button type="button" size="lg" color="neutral" variant="plain" onClick={onPrevious}>
                Back
              </Button>
            </div>
          </div>
        )}
      </Section>
    </FunnelFlowBody>
  )
}

export default StepPlatform
