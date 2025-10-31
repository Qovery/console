import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { match } from 'ts-pattern'
import { SCW_CONTROL_PLANE_FEATURE_ID } from '@qovery/domains/cloud-providers/feature'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import { CLUSTERS_CREATION_FEATURES_URL, CLUSTERS_CREATION_SUMMARY_URL } from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import StepResources from '../../../ui/page-clusters-create/step-resources/step-resources'
import { steps, useClusterContainerCreateContext } from '../page-clusters-create-feature'

export function StepResourcesFeature() {
  useDocumentTitle('Resources - Create Cluster')
  const { setResourcesData, resourcesData, setFeaturesData, setCurrentStep, generalData, creationFlowUrl } =
    useClusterContainerCreateContext()
  const navigate = useNavigate()

  useEffect(() => {
    setCurrentStep(steps(generalData).findIndex((step) => step.key === 'resources') + 1)
  }, [setCurrentStep, generalData?.cloud_provider, generalData?.installation_type])

  const methods = useForm<ClusterResourcesData>({
    defaultValues: resourcesData,
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    setResourcesData(data)

    match(generalData?.cloud_provider)
      .with('AWS', () => {
        navigate(creationFlowUrl + CLUSTERS_CREATION_FEATURES_URL)
      })
      .with('SCW', () => {
        navigate(creationFlowUrl + CLUSTERS_CREATION_FEATURES_URL)
      })
      .otherwise(() => {
        navigate(creationFlowUrl + CLUSTERS_CREATION_SUMMARY_URL)
        setFeaturesData(undefined)
      })
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <StepResources
          onSubmit={onSubmit}
          cloudProvider={generalData?.cloud_provider}
          clusterRegion={generalData?.region}
          isProduction={generalData?.production}
        />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepResourcesFeature
