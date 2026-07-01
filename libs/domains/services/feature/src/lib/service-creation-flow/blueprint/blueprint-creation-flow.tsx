import { useParams } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { FunnelFlow } from '@qovery/shared/ui'
import { BlueprintDetailsPanel } from '../../blueprint-details-panel/blueprint-details-panel'
import { useBlueprintCatalogServiceManifest } from '../../hooks/use-blueprint-catalog-service-manifest/use-blueprint-catalog-service-manifest'
import {
  BlueprintCreateContext,
  type BlueprintCreateFormData,
  type BlueprintCreationFlowProps,
} from './blueprint-create-context/blueprint-create-context'
import {
  getDefaultContextFieldValue,
  getDefaultFieldValue,
  isOptionalVariableField,
  isOverridableContextVariableField,
  isRequiredVariableField,
  sortBlueprintMajorVersions,
} from './blueprint-creation-utils/blueprint-creation-utils'

export {
  BlueprintCreateContext,
  type BlueprintCreateContextInterface,
  type BlueprintCreateFormData,
  type BlueprintCreationFlowProps,
  useBlueprintCreateContext,
} from './blueprint-create-context/blueprint-create-context'
export { BlueprintConfigurationView } from './blueprint-configuration-view/blueprint-configuration-view'
export { BlueprintStepSummary } from './blueprint-step-summary/blueprint-step-summary'

export const blueprintCreationSteps: { title: string }[] = [{ title: 'Configuration' }, { title: 'Summary' }]

export function BlueprintCreationFlow({ blueprint, children, onExit }: BlueprintCreationFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedBlueprint, setSelectedBlueprint] = useState<typeof blueprint | null>(null)
  const sortedBlueprintVersions = useMemo(
    () => sortBlueprintMajorVersions(blueprint.majorVersions),
    [blueprint.majorVersions]
  )
  const defaultBlueprintVersion = sortedBlueprintVersions[0]
  const [selectedVersionTag, setSelectedVersionTag] = useState(defaultBlueprintVersion?.latestTag ?? '')
  const selectedBlueprintVersion =
    sortedBlueprintVersions.find((majorVersion) => majorVersion.latestTag === selectedVersionTag) ??
    defaultBlueprintVersion
  const serviceVersion = selectedBlueprintVersion?.serviceVersion ?? 'latest'
  const versionTag = selectedBlueprintVersion?.latestTag ?? selectedVersionTag
  const serviceFamily = blueprint.serviceFamily ?? ''
  const {
    environmentId = '',
    organizationId = '',
    projectId = '',
    provider = blueprint.provider,
  } = useParams({ strict: false })
  const creationFlowUrl = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/create/blueprint/${encodeURIComponent(provider)}/${encodeURIComponent(serviceFamily)}`
  const { data: blueprintManifestFields = [] } = useBlueprintCatalogServiceManifest({
    organizationId,
    provider: blueprint.provider,
    serviceFamily,
    serviceVersion,
    environmentId,
    enabled: Boolean(serviceVersion) && Boolean(serviceFamily) && Boolean(environmentId),
    suspense: true,
  })

  const requiredBlueprintFields = useMemo(
    () => blueprintManifestFields.filter(isRequiredVariableField),
    [blueprintManifestFields]
  )
  const optionalBlueprintFields = useMemo(
    () => blueprintManifestFields.filter(isOptionalVariableField),
    [blueprintManifestFields]
  )
  const overridableContextBlueprintFields = useMemo(
    () => blueprintManifestFields.filter(isOverridableContextVariableField),
    [blueprintManifestFields]
  )
  const defaultBlueprintFieldValues = useMemo(() => {
    const fieldsWithDefaultValue = [...requiredBlueprintFields, ...optionalBlueprintFields]

    return {
      ...Object.fromEntries(fieldsWithDefaultValue.map((field) => [field.name, getDefaultFieldValue(field)])),
      ...Object.fromEntries(
        overridableContextBlueprintFields.map((field) => [field.name, getDefaultContextFieldValue(field)])
      ),
    }
  }, [optionalBlueprintFields, overridableContextBlueprintFields, requiredBlueprintFields])
  const form = useForm<BlueprintCreateFormData>({
    defaultValues: {
      serviceName: blueprint.name,
      versionTag,
      fields: defaultBlueprintFieldValues,
    },
    mode: 'onChange',
  })
  const watchedVersionTag = form.watch('versionTag')
  const previousVersionTagRef = useRef(versionTag)

  useEffect(() => {
    setSelectedVersionTag(watchedVersionTag)
  }, [watchedVersionTag])

  useEffect(() => {
    if (previousVersionTagRef.current === versionTag) {
      return
    }

    previousVersionTagRef.current = versionTag
    form.reset({
      ...form.getValues(),
      versionTag,
      fields: defaultBlueprintFieldValues,
    })
  }, [defaultBlueprintFieldValues, form, versionTag])

  return (
    <BlueprintCreateContext.Provider
      value={{
        blueprint,
        organizationId,
        creationFlowUrl,
        currentStep,
        setCurrentStep,
        form,
        onViewDetails: () => setSelectedBlueprint(blueprint),
        serviceVersion,
        requiredBlueprintFields,
        optionalBlueprintFields,
        overridableContextBlueprintFields,
      }}
    >
      <FormProvider {...form}>
        <FunnelFlow
          totalSteps={blueprintCreationSteps.length}
          currentStep={currentStep}
          currentTitle={blueprintCreationSteps[currentStep - 1]?.title}
          onExit={onExit}
        >
          {children}
        </FunnelFlow>
        <BlueprintDetailsPanel
          blueprint={selectedBlueprint}
          footerMode="close"
          open={Boolean(selectedBlueprint)}
          onOpenChange={(open) => {
            if (!open) setSelectedBlueprint(null)
          }}
          onExitComplete={() => setSelectedBlueprint(null)}
        />
      </FormProvider>
    </BlueprintCreateContext.Provider>
  )
}

export default BlueprintCreationFlow
