import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { type FormEventHandler, useEffect } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import { Button, FunnelFlowBody, Heading, Link, Section } from '@qovery/shared/ui'
import { ClusterResourcesSettings } from '../../cluster-resources-settings/cluster-resources-settings'
import { steps, useClusterContainerCreateContext } from '../cluster-creation-flow'

export interface StepResourcesProps {
  organizationId: string
  onSubmit: (data: ClusterResourcesData) => void
}

interface StepResourcesFormProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  organizationId: string
  cloudProvider?: CloudProviderEnum
  clusterRegion?: string
  isProduction?: boolean
}

function StepResourcesForm({
  onSubmit,
  organizationId,
  cloudProvider,
  clusterRegion,
  isProduction,
}: StepResourcesFormProps) {
  const { formState } = useFormContext<ClusterResourcesData>()

  return (
    <Section>
      <div className="mb-10 flex flex-col gap-2">
        <Heading>Resources</Heading>
        <p className="text-sm text-neutral-subtle">
          Customize the resources allocated to the cluster. You can adjust cluster resources anytime later from the
          settings panel.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <ClusterResourcesSettings
          cloudProvider={cloudProvider}
          clusterRegion={clusterRegion}
          fromDetail={false}
          isProduction={isProduction}
        />

        <div className="mt-10 flex justify-between">
          <Link
            as="button"
            size="lg"
            type="button"
            variant="plain"
            color="neutral"
            to="/organization/$organizationId/cluster/create/$slug/general"
            params={{ organizationId }}
          >
            Back
          </Link>
          <Button data-testid="button-submit" type="submit" disabled={!formState.isValid} size="lg">
            Continue
          </Button>
        </div>
      </form>
    </Section>
  )
}

export function StepResources({ organizationId, onSubmit }: StepResourcesProps) {
  const { resourcesData, setResourcesData, setCurrentStep, generalData } = useClusterContainerCreateContext()

  useEffect(() => {
    const stepIndex = steps(generalData).findIndex((step) => step.key === 'resources') + 1
    setCurrentStep(stepIndex)
  }, [setCurrentStep, generalData])

  const methods = useForm<ClusterResourcesData>({
    defaultValues: resourcesData,
    mode: 'onChange',
  })

  const handleSubmit = methods.handleSubmit((data) => {
    setResourcesData(data)
    onSubmit(data)
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <StepResourcesForm
          onSubmit={handleSubmit}
          organizationId={organizationId}
          cloudProvider={generalData?.cloud_provider}
          clusterRegion={generalData?.region}
          isProduction={generalData?.production}
        />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepResources
