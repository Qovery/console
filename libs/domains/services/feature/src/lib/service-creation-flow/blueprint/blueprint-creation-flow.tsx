import { useParams } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { FunnelFlow } from '@qovery/shared/ui'
import { BlueprintDetailsPanel } from '../../blueprint-details-panel/blueprint-details-panel'
import {
  BlueprintCreateContext,
  type BlueprintCreateFormData,
  type BlueprintCreationFlowProps,
} from './blueprint-create-context/blueprint-create-context'
import { sortBlueprintMajorVersions } from './blueprint-creation-utils/blueprint-creation-utils'

export {
  BlueprintCreateContext,
  type BlueprintCreateContextInterface,
  type BlueprintCreateFormData,
  type BlueprintCreationFlowProps,
  useBlueprintCreateContext,
} from './blueprint-create-context/blueprint-create-context'
export {
  BlueprintConfigurationView,
  BlueprintOverridesConfigurationSection,
  BlueprintServiceInformationSection,
  BlueprintSetupSection,
} from './blueprint-configuration-view/blueprint-configuration-view'
export {
  BlueprintManifestFieldsProvider,
  useBlueprintManifestFields,
} from './blueprint-manifest-context/blueprint-manifest-context'
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
  const defaultVersionTag = defaultBlueprintVersion?.latestTag ?? ''
  const form = useForm<BlueprintCreateFormData>({
    defaultValues: {
      serviceName: blueprint.name,
      versionTag: defaultVersionTag,
      fields: {},
    },
    mode: 'onChange',
  })
  const selectedVersionTag = form.watch('versionTag')
  const selectedBlueprintVersion =
    sortedBlueprintVersions.find((majorVersion) => majorVersion.latestTag === selectedVersionTag) ??
    defaultBlueprintVersion
  const serviceVersion = selectedBlueprintVersion?.serviceVersion ?? 'latest'
  const serviceFamily = blueprint.serviceFamily ?? ''
  const {
    environmentId = '',
    organizationId = '',
    projectId = '',
    provider = blueprint.provider,
  } = useParams({ strict: false })
  const creationFlowUrl = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/create/blueprint/${encodeURIComponent(provider)}/${encodeURIComponent(serviceFamily)}`

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
