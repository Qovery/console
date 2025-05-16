import { KubernetesEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { match } from 'ts-pattern'
import { SCW_CONTROL_PLANE_FEATURE_ID } from '@qovery/domains/cloud-providers/feature'
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
    setResourcesData(data)

    match(generalData?.cloud_provider)
      .with('AWS', () => {
        navigate(creationFlowUrl + CLUSTERS_CREATION_FEATURES_URL)
      })
      .with('SCW', () => {
        navigate(creationFlowUrl + CLUSTERS_CREATION_SUMMARY_URL)
        if (resourcesData) {
          setFeaturesData({
            vpc_mode: 'DEFAULT',
            features: {
              [SCW_CONTROL_PLANE_FEATURE_ID]: {
                id: SCW_CONTROL_PLANE_FEATURE_ID,
                title: 'Control Plane',
                value: true,
                extendedValue: resourcesData.scw_control_plane,
              },
            },
          })
        }
        setRemoteData({
          ssh_key: '',
        })
      })
      .otherwise(() => {
        navigate(creationFlowUrl + CLUSTERS_CREATION_SUMMARY_URL)
        setRemoteData({
          ssh_key: '',
        })
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
