import { CloudProviderEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import {
  CLUSTERS_CREATION_FEATURES_URL,
  CLUSTERS_CREATION_REMOTE_URL,
  CLUSTERS_CREATION_SUMMARY_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import StepResources from '../../../ui/page-clusters-create/step-resources/step-resources'
import { steps, useClusterContainerCreateContext } from '../page-clusters-create-feature'

export function StepResourcesFeature() {
  useDocumentTitle('Resources - Create Cluster')
  const {
    setResourcesData,
    resourcesData,
    setRemoteData,
    setFeaturesData,
    setCurrentStep,
    generalData,
    creationFlowUrl,
  } = useClusterContainerCreateContext()
  const navigate = useNavigate()

  useEffect(() => {
    setCurrentStep(steps(generalData, resourcesData?.cluster_type).findIndex((step) => step.key === 'resources') + 1)
  }, [setCurrentStep, generalData?.cloud_provider, generalData?.installation_type, resourcesData?.cluster_type])

  const methods = useForm<ClusterResourcesData>({
    defaultValues: resourcesData,
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (data.cluster_type === KubernetesEnum.K3_S) {
      data['nodes'] = [1, 1]
      setResourcesData(data)
    } else {
      setResourcesData(data)
    }

    if (generalData?.cloud_provider === CloudProviderEnum.AWS) {
      if (data.cluster_type === KubernetesEnum.K3_S) {
        navigate(creationFlowUrl + CLUSTERS_CREATION_REMOTE_URL)
        setFeaturesData(undefined)
      } else {
        navigate(creationFlowUrl + CLUSTERS_CREATION_FEATURES_URL)
        setRemoteData({
          ssh_key: '',
        })
      }
    } else {
      navigate(creationFlowUrl + CLUSTERS_CREATION_SUMMARY_URL)
      setRemoteData({
        ssh_key: '',
      })
      setFeaturesData(undefined)
    }
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
