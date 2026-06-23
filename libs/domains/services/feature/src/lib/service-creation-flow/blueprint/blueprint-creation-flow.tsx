import { useParams } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { FunnelFlow } from '@qovery/shared/ui'
import { useBlueprintCatalogServiceManifest } from '../../hooks/use-blueprint-catalog-service-manifest/use-blueprint-catalog-service-manifest'
import { BlueprintDetailsPanel } from '../../blueprint-details-panel/blueprint-details-panel'
import {
  BlueprintCreateContext,
  type BlueprintCreateFormData,
  type BlueprintCreationFlowProps,
} from './blueprint-create-context/blueprint-create-context'
import {
  getBlueprintFieldPath,
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
  const form = useForm<BlueprintCreateFormData>({
    defaultValues: {
      serviceName: blueprint.name,
      fields: {},
    },
    mode: 'onChange',
  })
  const { data: blueprintManifestFields = [] } = useBlueprintCatalogServiceManifest({
    organizationId,
    provider: blueprint.provider,
    serviceFamily,
    serviceVersion,
    environmentId,
    enabled: Boolean(serviceVersion) && Boolean(serviceFamily) && Boolean(environmentId),
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

  useEffect(() => {
    const fieldsWithDefaultValue = [...requiredBlueprintFields, ...optionalBlueprintFields]
    if (!fieldsWithDefaultValue.length && !overridableContextBlueprintFields.length) return

    const currentValues = form.getValues('fields')
    const nextValues = { ...currentValues }

    fieldsWithDefaultValue.forEach((field) => {
      if (nextValues[field.name] !== undefined) return

      nextValues[field.name] = getDefaultFieldValue(field)
      form.setValue(getBlueprintFieldPath(field.name), nextValues[field.name], { shouldValidate: true })
    })

    overridableContextBlueprintFields.forEach((field) => {
      if (nextValues[field.name] !== undefined) return

      nextValues[field.name] = getDefaultContextFieldValue(field)
      form.setValue(getBlueprintFieldPath(field.name), nextValues[field.name], { shouldValidate: true })
    })
  }, [form, optionalBlueprintFields, overridableContextBlueprintFields, requiredBlueprintFields])

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
