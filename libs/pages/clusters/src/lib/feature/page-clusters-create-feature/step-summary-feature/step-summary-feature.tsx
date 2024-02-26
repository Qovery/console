import {
  type ClusterCloudProviderInfoRequest,
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
  CLUSTERS_CREATION_KUBECONFIG_URL,
  CLUSTERS_CREATION_REMOTE_URL,
  CLUSTERS_CREATION_RESOURCES_URL,
  CLUSTERS_CREATION_URL,
  CLUSTERS_GENERAL_URL,
  CLUSTERS_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import StepSummary from '../../../ui/page-clusters-create/step-summary/step-summary'
import { steps, useClusterContainerCreateContext } from '../page-clusters-create-feature'

export function getValueByKey(key: string, data: { [key: string]: string }[] = []): string[] {
  const result: string[] = []
  data.forEach((obj) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result.push(obj[key])
    }
  })
  return result
}

export function StepSummaryFeature() {
  useDocumentTitle('Summary - Create Cluster')
  const { generalData, kubeconfigData, resourcesData, featuresData, remoteData, setCurrentStep } =
    useClusterContainerCreateContext()
  const navigate = useNavigate()
  const { organizationId = '' } = useParams()

  const pathCreate = `${CLUSTERS_URL(organizationId)}${CLUSTERS_CREATION_URL}`

  const { mutateAsync: createCluster, isLoading: isCreateClusterLoading } = useCreateCluster()
  const { mutateAsync: editCloudProviderInfo } = useEditCloudProviderInfo({ silently: true })
  const { mutateAsync: deployCluster, isLoading: isDeployClusterLoading } = useDeployCluster()
  const { data: cloudProviderInstanceTypes } = useCloudProviderInstanceTypes(
    match(generalData)
      .with({ cloud_provider: 'AWS', installation_type: 'MANAGED' }, ({ cloud_provider, region }) => ({
        cloudProvider: cloud_provider,
        clusterType: (resourcesData?.cluster_type ?? 'MANAGED') as (typeof KubernetesEnum)[keyof typeof KubernetesEnum],
        region,
      }))
      .with({ cloud_provider: 'SCW', installation_type: 'MANAGED' }, ({ cloud_provider, region }) => ({
        cloudProvider: cloud_provider,
        clusterType: 'MANAGED' as const,
        region: region,
      }))
      .with({ cloud_provider: 'GCP', installation_type: 'MANAGED' }, ({ cloud_provider }) => ({
        cloudProvider: cloud_provider,
        clusterType: 'MANAGED' as const,
      }))
      .otherwise(() => ({ enabled: false }))
  )
  const detailInstanceType = cloudProviderInstanceTypes?.find(({ type }) => type === resourcesData?.instance_type)

  const goToKubeconfig = useCallback(() => {
    navigate(pathCreate + CLUSTERS_CREATION_KUBECONFIG_URL)
  }, [navigate, pathCreate])

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
    if (generalData?.installation_type === 'SELF_MANAGED') {
      goToKubeconfig()
      return
    }
    return match(generalData?.cloud_provider)
      .with('AWS', () => {
        if (resourcesData?.cluster_type === KubernetesEnum.K3_S) {
          goToRemote()
        } else {
          goToFeatures()
        }
      })
      .with('GCP', () => {
        goToGeneral()
      })
      .otherwise(() => goToResources())
  }

  useEffect(() => {
    !generalData?.name && navigate(pathCreate + CLUSTERS_CREATION_GENERAL_URL)
  }, [pathCreate, generalData, navigate, organizationId])

  const onSubmit = async (withDeploy: boolean) => {
    if (!generalData) {
      throw new Error('Invalid generalData')
    }
    const cloud_provider_credentials: ClusterCloudProviderInfoRequest = {
      cloud_provider: generalData.cloud_provider,
      credentials: {
        id: generalData.credentials,
        name: generalData.credentials_name,
      },
      region: generalData.region,
    }

    if (generalData.installation_type === 'SELF_MANAGED' && kubeconfigData) {
      try {
        const cluster = await createCluster({
          organizationId,
          clusterRequest: {
            name: generalData.name,
            description: generalData.description,
            region: generalData.region,
            cloud_provider: generalData.cloud_provider,
            kubernetes: 'SELF_MANAGED',
            production: true,
            ssh_keys: [],
            kubeconfig: kubeconfigData.file_content,
            features: [],
            cloud_provider_credentials,
          },
        })
        await editCloudProviderInfo({
          organizationId,
          clusterId: cluster.id,
          cloudProviderInfoRequest: cloud_provider_credentials,
        })
        navigate({
          pathname: CLUSTERS_URL(organizationId) + CLUSTERS_GENERAL_URL,
          search: '?show-self-managed-guide',
        })
      } catch (e) {
        console.error(e)
      }
      return
    }
    if (resourcesData) {
      let formatFeatures: ClusterRequestFeaturesInner[] | undefined
      if (featuresData && featuresData.vpc_mode === 'DEFAULT') {
        formatFeatures = Object.keys(featuresData.features)
          .map(
            (id: string) =>
              featuresData.features[id]?.value && {
                id: id,
                value: featuresData.features[id].extendedValue || featuresData.features[id].value,
              }
          )
          .filter(Boolean) as ClusterRequestFeaturesInner[]
      } else {
        formatFeatures = [
          {
            id: 'EXISTING_VPC',
            value: {
              aws_vpc_eks_id: featuresData?.aws_existing_vpc?.aws_vpc_eks_id ?? '',
              eks_subnets_zone_a_ids: getValueByKey('A', featuresData?.aws_existing_vpc?.eks_subnets)!,
              eks_subnets_zone_b_ids: getValueByKey('B', featuresData?.aws_existing_vpc?.eks_subnets)!,
              eks_subnets_zone_c_ids: getValueByKey('C', featuresData?.aws_existing_vpc?.eks_subnets)!,
              // Those are the name that AWS give them
              // MongoDB => documentdb
              documentdb_subnets_zone_a_ids: getValueByKey('A', featuresData?.aws_existing_vpc?.mongodb_subnets)!,
              documentdb_subnets_zone_b_ids: getValueByKey('B', featuresData?.aws_existing_vpc?.mongodb_subnets)!,
              documentdb_subnets_zone_c_ids: getValueByKey('C', featuresData?.aws_existing_vpc?.mongodb_subnets)!,
              // Redis => elasticache
              elasticache_subnets_zone_a_ids: getValueByKey('A', featuresData?.aws_existing_vpc?.redis_subnets)!,
              elasticache_subnets_zone_b_ids: getValueByKey('B', featuresData?.aws_existing_vpc?.redis_subnets)!,
              elasticache_subnets_zone_c_ids: getValueByKey('C', featuresData?.aws_existing_vpc?.redis_subnets)!,
              // MySQL and PostgreSQL => rds
              rds_subnets_zone_a_ids: getValueByKey(
                'A',
                featuresData?.aws_existing_vpc?.mysql_subnets &&
                  featuresData?.aws_existing_vpc?.redis_subnets && [
                    ...featuresData.aws_existing_vpc.mysql_subnets,
                    ...featuresData.aws_existing_vpc.redis_subnets,
                  ]
              )!,
            },
          },
        ]
      }

      const clusterRequest = match(generalData.cloud_provider)
        .returnType<ClusterRequest>()
        .with('GCP', () => ({
          name: generalData.name,
          description: generalData.description || '',
          production: generalData.production,
          cloud_provider: generalData.cloud_provider,
          region: generalData.region,
          cloud_provider_credentials,
        }))
        .otherwise(() => ({
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
          cloud_provider_credentials,
        }))

      try {
        const cluster = await createCluster({
          organizationId,
          clusterRequest,
        })
        await editCloudProviderInfo({
          organizationId,
          clusterId: cluster.id,
          cloudProviderInfoRequest: cloud_provider_credentials,
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
    setCurrentStep(steps(generalData, resourcesData?.cluster_type).findIndex((step) => step.key === 'summary') + 1)
  }, [setCurrentStep, generalData?.cloud_provider, generalData?.installation_type, resourcesData?.cluster_type])

  return (
    <FunnelFlowBody>
      {generalData && resourcesData && (
        <StepSummary
          isLoadingCreate={isCreateClusterLoading}
          isLoadingCreateAndDeploy={isCreateClusterLoading || isDeployClusterLoading}
          onSubmit={onSubmit}
          onPrevious={onBack}
          generalData={generalData}
          kubeconfigData={kubeconfigData}
          resourcesData={resourcesData}
          featuresData={featuresData}
          remoteData={remoteData}
          detailInstanceType={detailInstanceType}
          goToResources={goToResources}
          goToGeneral={goToGeneral}
          goToFeatures={goToFeatures}
          goToKubeconfig={goToKubeconfig}
          goToRemote={goToRemote}
        />
      )}
    </FunnelFlowBody>
  )
}

export default StepSummaryFeature
