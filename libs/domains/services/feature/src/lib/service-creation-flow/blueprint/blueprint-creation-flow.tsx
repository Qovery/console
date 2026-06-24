import { useParams } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
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
} from './blueprint-creation-utils/blueprint-creation-utils'

export {
  BlueprintCreateContext,
  type BlueprintConfigurationSection,
  type BlueprintCreateContextInterface,
  type BlueprintCreateFormData,
  type BlueprintCreationFlowProps,
  useBlueprintCreateContext,
} from './blueprint-create-context/blueprint-create-context'
export { BlueprintConfigurationView } from './blueprint-configuration-view/blueprint-configuration-view'
export { BlueprintStepSummary } from './blueprint-step-summary/blueprint-step-summary'

export const blueprintCreationSteps: { title: string }[] = [{ title: 'Configuration' }, { title: 'Summary' }]

export function BlueprintCreationFlow({
  blueprint,
  children,
  creationFlowUrl,
  organizationId,
  onExit,
}: BlueprintCreationFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedBlueprint, setSelectedBlueprint] = useState<typeof blueprint | null>(null)
  const serviceVersion = blueprint.majorVersions[0]?.serviceVersion ?? 'latest'
  const serviceFamily = blueprint.serviceFamily ?? ''
  const { environmentId = '' } = useParams({ strict: false })
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
      fields: defaultBlueprintFieldValues,
    },
    mode: 'onChange',
  })

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
          deployPath={creationFlowUrl}
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
