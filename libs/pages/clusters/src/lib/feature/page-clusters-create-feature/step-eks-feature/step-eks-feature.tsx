import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ClusterEksSettings } from '@qovery/domains/clusters/feature'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import {
  CLUSTERS_CREATION_GENERAL_URL,
  CLUSTERS_CREATION_SUMMARY_URL,
  CLUSTERS_CREATION_URL,
  CLUSTERS_URL,
} from '@qovery/shared/routes'
import { Button, FunnelFlowBody, Heading, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useClusterContainerCreateContext } from '../page-clusters-create-feature'

export function StepEKSFeature() {
  useDocumentTitle('EKS configuration - Create Cluster')
  const { organizationId = '' } = useParams()
  const { setResourcesData, resourcesData, setCurrentStep, creationFlowUrl } = useClusterContainerCreateContext()
  const navigate = useNavigate()

  useEffect(() => {
    setCurrentStep(3)
  }, [setCurrentStep])

  const methods = useForm<ClusterResourcesData>({
    defaultValues: resourcesData,
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    setResourcesData(data)
    navigate(creationFlowUrl + CLUSTERS_CREATION_SUMMARY_URL)
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <Section>
          <div className="mb-10 flex flex-col gap-2">
            <Heading>EKS configuration</Heading>
            <p className="text-sm text-neutral-350">Configure your EKS cluster to use the Qovery platform.</p>
          </div>

          <form onSubmit={onSubmit}>
            <div className="space-y-10">
              <ClusterEksSettings />

              <div className="flex justify-between">
                <Button
                  onClick={() =>
                    navigate(`${CLUSTERS_URL(organizationId)}${CLUSTERS_CREATION_URL}${CLUSTERS_CREATION_GENERAL_URL}`)
                  }
                  type="button"
                  variant="plain"
                  size="lg"
                >
                  Back
                </Button>
                <Button data-testid="button-submit" type="submit" disabled={!methods.formState.isValid} size="lg">
                  Continue
                </Button>
              </div>
            </div>
          </form>
        </Section>
      </FormProvider>
    </FunnelFlowBody>
  )
}
