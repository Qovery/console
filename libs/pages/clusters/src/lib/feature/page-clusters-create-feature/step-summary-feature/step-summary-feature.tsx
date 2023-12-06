import {
  CloudProviderEnum,
  type ClusterRequest,
  type ClusterRequestFeaturesInner,
  KubernetesEnum,
} from 'qovery-typescript-axios'
import { useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useCloudProviderInstanceTypes } from '@qovery/domains/cloud-providers/feature'
import { useCreateCluster, useDeployCluster, useEditCloudProviderInfo } from '@qovery/domains/clusters/feature'
import {
  CLUSTERS_CREATION_FEATURES_URL,
  CLUSTERS_CREATION_GENERAL_URL,
  CLUSTERS_CREATION_REMOTE_URL,
  CLUSTERS_CREATION_RESOURCES_URL,
  CLUSTERS_CREATION_URL,
  CLUSTERS_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import StepSummary from '../../../ui/page-clusters-create/step-summary/step-summary'
import { steps, useClusterContainerCreateContext } from '../page-clusters-create-feature'

export function StepSummaryFeature() {
  useDocumentTitle('Summary - Create Database')
  const { generalData, resourcesData, featuresData, remoteData, setCurrentStep } = useClusterContainerCreateContext()
  const navigate = useNavigate()
  const { organizationId = '' } = useParams()

  const pathCreate = `${CLUSTERS_URL(organizationId)}${CLUSTERS_CREATION_URL}`

  const { mutateAsync: createCluster, isLoading: isCreateClusterLoading } = useCreateCluster()
  const { mutateAsync: editCloudProviderInfo } = useEditCloudProviderInfo({ silently: true })
  const { mutateAsync: deployCluster, isLoading: isDeployClusterLoading } = useDeployCluster()
  const { data: cloudProviderInstanceTypes } = useCloudProviderInstanceTypes(
    match(generalData?.cloud_provider || CloudProviderEnum.AWS)
      .with('AWS', (cloudProvider) => ({
        cloudProvider,
        clusterType: (resourcesData?.cluster_type ?? 'MANAGED') as (typeof KubernetesEnum)[keyof typeof KubernetesEnum],
        region: generalData?.region || '',
      }))
      .with('SCW', (cloudProvider) => ({
        cloudProvider,
        clusterType: 'MANAGED' as const,
        region: generalData?.region || '',
      }))
      .with('DO', (cloudProvider) => ({
        cloudProvider,
        clusterType: 'MANAGED' as const,
      }))
      .exhaustive()
  )
  const detailInstanceType = cloudProviderInstanceTypes?.find(({ type }) => type === resourcesData?.instance_type)

  const goToFeatures = useCallback(() => {
    navigate(pathCreate + CLUSTERS_CREATION_FEATURES_URL)
  }, [navigate, pathCreate])

  const goToGeneral = () => {
    navigate(pathCreate + CLUSTERS_CREATION_GENERAL_URL)
  }

  const goToResources = () => {
    navigate(pathCreate + CLUSTERS_CREATION_RESOURCES_URL)
  }

  const goToRemote = () => {
    navigate(pathCreate + CLUSTERS_CREATION_REMOTE_URL)
  }

  const onBack = () => {
    if (generalData?.cloud_provider === CloudProviderEnum.AWS) {
      if (resourcesData?.cluster_type === KubernetesEnum.K3_S) {
        goToRemote()
      } else {
        goToFeatures()
      }
    } else {
      goToResources()
    }
  }

  useEffect(() => {
    !generalData?.name && navigate(pathCreate + CLUSTERS_CREATION_GENERAL_URL)
  }, [pathCreate, generalData, navigate, organizationId])

  const onSubmit = async (withDeploy: boolean) => {
    if (generalData && resourcesData) {
      const formatFeatures =
        featuresData &&
        Object.keys(featuresData)
          .map(
            (id: string) =>
              featuresData[id].value && {
                id: id,
                value: featuresData[id].extendedValue || featuresData[id].value,
              }
          )
          .filter(Boolean)

      const clusterRequest: ClusterRequest = {
        name: generalData.name,
        description: generalData.description || '',
        production: generalData.production,
        cloud_provider: generalData.cloud_provider,
        region: generalData.region,
        min_running_nodes: resourcesData.nodes[0],
        max_running_nodes: resourcesData.nodes[1],
        disk_size: resourcesData.disk_size,
        instance_type: resourcesData.instance_type,
        kubernetes: resourcesData.cluster_type as KubernetesEnum,
        features: formatFeatures as ClusterRequestFeaturesInner[],
        ssh_keys: remoteData?.ssh_key ? [remoteData?.ssh_key] : undefined,
      }

      try {
        const cluster = await createCluster({
          organizationId,
          clusterRequest,
        })
        await editCloudProviderInfo({
          organizationId,
          clusterId: cluster.id,
          cloudProviderInfoRequest: {
            cloud_provider: generalData.cloud_provider,
            credentials: {
              id: generalData.credentials,
              name: generalData.credentials_name,
            },
            region: generalData.region,
          },
        })

        if (withDeploy) {
          await deployCluster({ clusterId: cluster.id, organizationId })
        }
        navigate(CLUSTERS_URL(organizationId))
      } catch (e) {
        console.error(e)
      }
    }
  }

  useEffect(() => {
    setCurrentStep(
      steps(generalData?.cloud_provider, resourcesData?.cluster_type).findIndex((step) => step.key === 'summary') + 1
    )
  }, [setCurrentStep, generalData?.cloud_provider, resourcesData?.cluster_type])

  return (
    <FunnelFlowBody>
      {generalData && resourcesData && (
        <StepSummary
          isLoadingCreate={isCreateClusterLoading}
          isLoadingCreateAndDeploy={isCreateClusterLoading || isDeployClusterLoading}
          onSubmit={onSubmit}
          onPrevious={onBack}
          generalData={generalData}
          resourcesData={resourcesData}
          featuresData={featuresData}
          remoteData={remoteData}
          detailInstanceType={detailInstanceType}
          goToResources={goToResources}
          goToGeneral={goToGeneral}
          goToFeatures={goToFeatures}
          goToRemote={goToRemote}
        />
      )}
    </FunnelFlowBody>
  )
}

export default StepSummaryFeature
