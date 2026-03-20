import { useNavigate } from '@tanstack/react-router'
import { type FormEventHandler, useEffect } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { GitRepositorySettings } from '@qovery/domains/organizations/feature'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import { Button, FunnelFlowBody, Heading, Section } from '@qovery/shared/ui'
import { ClusterEksSettings } from '../../cluster-eks-settings/cluster-eks-settings'
import {
  type ClusterEksSettingsFormData,
  getEksAnywhereGitFormValues,
  getInfrastructureChartsParametersWithEksAnywhereGit,
  stripEksAnywhereGitFormFields,
} from '../../cluster-eks-settings/cluster-eks-settings-form.utils'
import { steps, useClusterContainerCreateContext } from '../cluster-creation-flow'

export interface StepEksProps {
  organizationId: string
  onSubmit: () => void
}

interface StepEksFormProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  organizationId: string
}

function StepEksForm({ onSubmit, organizationId }: StepEksFormProps) {
  const navigate = useNavigate()
  const { formState } = useFormContext<ClusterEksSettingsFormData>()
  const { creationFlowUrl } = useClusterContainerCreateContext()

  return (
    <Section>
      <div className="mb-10 flex flex-col gap-2">
        <Heading>EKS configuration</Heading>
        <p className="text-sm text-neutral-subtle">Configure your EKS cluster to use the Qovery platform.</p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="space-y-10">
          <ClusterEksSettings
            gitSettings={
              <GitRepositorySettings
                gitDisabled={false}
                showAuthProviders={false}
                organizationId={organizationId}
                rootPathLabel="YAML file path"
                rootPathHint="Provide the path to the EKS Anywhere cluster YAML file in the repository."
              />
            }
          />

          <div className="flex justify-between">
            <Button
              type="button"
              variant="plain"
              color="neutral"
              size="lg"
              onClick={() => navigate({ to: `${creationFlowUrl}/kubeconfig` })}
            >
              Back
            </Button>
            <Button data-testid="button-submit" type="submit" disabled={!formState.isValid} size="lg">
              Continue
            </Button>
          </div>
        </div>
      </form>
    </Section>
  )
}

export function StepEks({ organizationId, onSubmit }: StepEksProps) {
  const { resourcesData, setResourcesData, setCurrentStep, generalData } = useClusterContainerCreateContext()

  useEffect(() => {
    const stepIndex = steps(generalData).findIndex((step) => step.key === 'eks') + 1
    setCurrentStep(stepIndex)
  }, [generalData, setCurrentStep])

  const methods = useForm<ClusterEksSettingsFormData>({
    defaultValues: {
      ...(resourcesData as ClusterResourcesData),
      ...getEksAnywhereGitFormValues(resourcesData),
    },
    mode: 'onChange',
  })

  useEffect(() => {
    methods.reset({
      ...(resourcesData as ClusterResourcesData),
      ...getEksAnywhereGitFormValues(resourcesData),
    })
  }, [methods, resourcesData])

  const handleSubmit = methods.handleSubmit((data) => {
    setResourcesData({
      ...stripEksAnywhereGitFormFields(data),
      infrastructure_charts_parameters: getInfrastructureChartsParametersWithEksAnywhereGit(data),
    })
    onSubmit()
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <StepEksForm onSubmit={handleSubmit} organizationId={organizationId} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepEks
