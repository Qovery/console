import { useNavigate } from '@tanstack/react-router'
import {
  type ClusterCloudProviderInfoRequest,
  type ClusterRequest,
  type ClusterRequestFeaturesInner,
  type KubernetesEnum,
} from 'qovery-typescript-axios'
import { useCallback, useEffect } from 'react'
import { match } from 'ts-pattern'
import { SCW_CONTROL_PLANE_FEATURE_ID, useCloudProviderInstanceTypes } from '@qovery/domains/cloud-providers/feature'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useCreateCluster } from '../../hooks/use-create-cluster/use-create-cluster'
import { useDeployCluster } from '../../hooks/use-deploy-cluster/use-deploy-cluster'
import { useEditCloudProviderInfo } from '../../hooks/use-edit-cloud-provider-info/use-edit-cloud-provider-info'
import { steps, useClusterContainerCreateContext } from '../cluster-creation-flow'
import { StepSummaryPresentation } from './step-summary-presentation'

export interface StepSummaryProps {
  organizationId: string
}

function getValueByKey(key: string, data: { [key: string]: string }[] = []): string[] {
  return data.reduce((result: string[], obj) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) result.push(obj[key])
    return result
  }, [])
}

export function StepSummary({ organizationId }: StepSummaryProps) {
  const navigate = useNavigate()
  const { generalData, kubeconfigData, resourcesData, featuresData, setCurrentStep, creationFlowUrl } =
    useClusterContainerCreateContext()
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
        region,
      }))
      .with({ cloud_provider: 'GCP', installation_type: 'MANAGED' }, ({ cloud_provider }) => ({
        cloudProvider: cloud_provider,
        clusterType: 'MANAGED' as const,
      }))
      .with({ cloud_provider: 'AZURE', installation_type: 'MANAGED' }, ({ cloud_provider, region }) => ({
        cloudProvider: cloud_provider,
        clusterType: 'MANAGED' as const,
        region,
      }))
      .otherwise(() => ({ enabled: false }))
  )
  const detailInstanceType = cloudProviderInstanceTypes?.find(({ type }) => type === resourcesData?.instance_type)

  const goToKubeconfig = useCallback(
    () => navigate({ to: `${creationFlowUrl}/kubeconfig` }),
    [navigate, creationFlowUrl]
  )
  const goToFeatures = useCallback(() => navigate({ to: `${creationFlowUrl}/features` }), [navigate, creationFlowUrl])
  const goToGeneral = () => navigate({ to: `${creationFlowUrl}/general` })
  const goToResources = () => navigate({ to: `${creationFlowUrl}/resources` })
  const goToEksConfig = () => navigate({ to: `${creationFlowUrl}/eks` })

  const onBack = () => {
    if (generalData?.installation_type === 'SELF_MANAGED') {
      goToKubeconfig()
      return
    }
    return match(generalData?.cloud_provider)
      .with('AWS', () => goToFeatures())
      .with('GCP', () => goToFeatures())
      .with('SCW', () => goToFeatures())
      .otherwise(() => goToResources())
  }

  useEffect(() => {
    if (!generalData?.name) {
      navigate({ to: `${creationFlowUrl}/general` })
    }
  }, [creationFlowUrl, generalData, navigate])

  const onSubmit = async (withDeploy: boolean) => {
    if (!generalData) throw new Error('Invalid generalData')

    const cloudProviderCredentials: ClusterCloudProviderInfoRequest = {
      cloud_provider: generalData.cloud_provider,
      credentials: { id: generalData.credentials, name: generalData.credentials_name },
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
            production: generalData.production,
            features: [],
            cloud_provider_credentials: cloudProviderCredentials,
          },
        })
        await editCloudProviderInfo({
          organizationId,
          clusterId: cluster.id,
          cloudProviderInfoRequest: cloudProviderCredentials,
        })
        navigate({
          to: '/organization/$organizationId/cluster/$clusterId/overview',
          params: { organizationId, clusterId: cluster.id },
          search: { 'show-self-managed-guide': true },
        })
      } catch (error) {
        console.error(error)
      }
      return
    }

    if (generalData.installation_type === 'PARTIALLY_MANAGED') {
      try {
        await createCluster({
          organizationId,
          clusterRequest: {
            name: generalData.name,
            description: generalData.description,
            region: generalData.region,
            cloud_provider: generalData.cloud_provider,
            kubernetes: 'PARTIALLY_MANAGED',
            production: generalData.production,
            features: [],
            cloud_provider_credentials: cloudProviderCredentials,
            infrastructure_charts_parameters: resourcesData?.infrastructure_charts_parameters,
          },
        })
        navigate({ to: `/organization/${organizationId}/clusters` })
      } catch (error) {
        console.error(error)
      }
      return
    }

    if (!resourcesData) return

    let formatFeatures: ClusterRequestFeaturesInner[] = []

    if (generalData.cloud_provider === 'AWS' || generalData.cloud_provider === 'GCP') {
      if (featuresData && featuresData.vpc_mode === 'DEFAULT') {
        formatFeatures = Object.keys(featuresData.features)
          .map(
            (id: string) =>
              featuresData.features[id]?.value && {
                id,
                value: featuresData.features[id].extendedValue || featuresData.features[id].value,
              }
          )
          .filter(Boolean) as ClusterRequestFeaturesInner[]
      } else if (generalData.cloud_provider === 'AWS') {
        formatFeatures = [
          {
            id: 'EXISTING_VPC',
            value: {
              aws_vpc_eks_id: featuresData?.aws_existing_vpc?.aws_vpc_eks_id ?? '',
              eks_create_nodes_in_private_subnet:
                featuresData?.aws_existing_vpc?.eks_create_nodes_in_private_subnet ?? false,
              eks_subnets_zone_a_ids: getValueByKey('A', featuresData?.aws_existing_vpc?.eks_subnets),
              eks_subnets_zone_b_ids: getValueByKey('B', featuresData?.aws_existing_vpc?.eks_subnets),
              eks_subnets_zone_c_ids: getValueByKey('C', featuresData?.aws_existing_vpc?.eks_subnets),
              eks_karpenter_fargate_subnets_zone_a_ids: getValueByKey(
                'A',
                featuresData?.aws_existing_vpc?.eks_karpenter_fargate_subnets
              ),
              eks_karpenter_fargate_subnets_zone_b_ids: getValueByKey(
                'B',
                featuresData?.aws_existing_vpc?.eks_karpenter_fargate_subnets
              ),
              eks_karpenter_fargate_subnets_zone_c_ids: getValueByKey(
                'C',
                featuresData?.aws_existing_vpc?.eks_karpenter_fargate_subnets
              ),
              documentdb_subnets_zone_a_ids: getValueByKey('A', featuresData?.aws_existing_vpc?.mongodb_subnets),
              documentdb_subnets_zone_b_ids: getValueByKey('B', featuresData?.aws_existing_vpc?.mongodb_subnets),
              documentdb_subnets_zone_c_ids: getValueByKey('C', featuresData?.aws_existing_vpc?.mongodb_subnets),
              elasticache_subnets_zone_a_ids: getValueByKey('A', featuresData?.aws_existing_vpc?.redis_subnets),
              elasticache_subnets_zone_b_ids: getValueByKey('B', featuresData?.aws_existing_vpc?.redis_subnets),
              elasticache_subnets_zone_c_ids: getValueByKey('C', featuresData?.aws_existing_vpc?.redis_subnets),
              rds_subnets_zone_a_ids: getValueByKey('A', featuresData?.aws_existing_vpc?.rds_subnets),
              rds_subnets_zone_b_ids: getValueByKey('B', featuresData?.aws_existing_vpc?.rds_subnets),
              rds_subnets_zone_c_ids: getValueByKey('C', featuresData?.aws_existing_vpc?.rds_subnets),
            },
          },
        ]
      } else if (generalData.cloud_provider === 'GCP') {
        formatFeatures = [
          {
            id: 'EXISTING_VPC',
            value: {
              vpc_name: featuresData?.gcp_existing_vpc?.vpc_name ?? '',
              vpc_project_id: featuresData?.gcp_existing_vpc?.vpc_project_id,
              ip_range_services_name: featuresData?.gcp_existing_vpc?.ip_range_services_name,
              ip_range_pods_name: featuresData?.gcp_existing_vpc?.ip_range_pods_name,
              subnetwork_name: featuresData?.gcp_existing_vpc?.subnetwork_name,
              additional_ip_range_pods_names:
                featuresData?.gcp_existing_vpc?.additional_ip_range_pods_names?.split(','),
            },
          },
        ]
      }
    }

    if (generalData.cloud_provider === 'AWS' && resourcesData.karpenter?.enabled) {
      formatFeatures.push({
        id: 'KARPENTER',
        value: {
          spot_enabled: resourcesData.karpenter.spot_enabled,
          disk_size_in_gib: resourcesData.karpenter.disk_size_in_gib,
          disk_iops: resourcesData.karpenter.disk_iops,
          disk_throughput: resourcesData.karpenter.disk_throughput,
          default_service_architecture: resourcesData.karpenter.default_service_architecture,
          qovery_node_pools: resourcesData.karpenter.qovery_node_pools,
        } as unknown as ClusterRequestFeaturesInner['value'],
      })
    }

    const clusterRequest = match(generalData.cloud_provider)
      .returnType<ClusterRequest>()
      .with('GCP', () => ({
        name: generalData.name,
        description: generalData.description || '',
        production: generalData.production,
        cloud_provider: generalData.cloud_provider,
        features: formatFeatures,
        region: generalData.region,
        cloud_provider_credentials: cloudProviderCredentials,
      }))
      .with('SCW', () => {
        const scwFeatures: ClusterRequestFeaturesInner[] = [
          { id: SCW_CONTROL_PLANE_FEATURE_ID, value: resourcesData.scw_control_plane },
        ]
        if (featuresData?.features) {
          Object.keys(featuresData.features).forEach((featureId) => {
            if (featureId === SCW_CONTROL_PLANE_FEATURE_ID) return
            const featureData = featuresData.features[featureId]
            if (featureId === 'NAT_GATEWAY' && featureData.extendedValue) {
              scwFeatures.push({
                id: featureId,
                value: {
                  nat_gateway_type: { provider: 'scaleway', type: featureData.extendedValue },
                } as unknown as ClusterRequestFeaturesInner['value'],
              })
            } else if (featureData.value) {
              scwFeatures.push({ id: featureId, value: featureData.extendedValue || featureData.value })
            }
          })
        }
        return {
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
          cloud_provider_credentials: cloudProviderCredentials,
          features: scwFeatures,
        }
      })
      .otherwise(() => {
        if (resourcesData.karpenter?.enabled) {
          return {
            name: generalData.name,
            description: generalData.description || '',
            production: generalData.production,
            cloud_provider: generalData.cloud_provider,
            region: generalData.region,
            kubernetes: resourcesData.cluster_type as KubernetesEnum,
            features: formatFeatures,
            cloud_provider_credentials: cloudProviderCredentials,
          }
        }

        return {
          name: generalData.name,
          description: generalData.description || '',
          production: generalData.production,
          cloud_provider: generalData.cloud_provider,
          region: generalData.region,
          min_running_nodes: resourcesData.nodes[0],
          max_running_nodes: resourcesData.nodes[1],
          disk_size: resourcesData.disk_size,
          disk_iops: generalData.cloud_provider === 'AWS' ? resourcesData.disk_iops : undefined,
          disk_throughput: generalData.cloud_provider === 'AWS' ? resourcesData.disk_throughput : undefined,
          instance_type: resourcesData.instance_type,
          kubernetes: resourcesData.cluster_type as KubernetesEnum,
          features: formatFeatures,
          cloud_provider_credentials: cloudProviderCredentials,
        }
      })

    try {
      const cluster = await createCluster({ organizationId, clusterRequest })
      await editCloudProviderInfo({
        organizationId,
        clusterId: cluster.id,
        cloudProviderInfoRequest: cloudProviderCredentials,
      })
      if (withDeploy) {
        await deployCluster({ clusterId: cluster.id, organizationId })
      }
      navigate({ to: `/organization/${organizationId}/clusters` })
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const stepIndex = steps(generalData).findIndex((step) => step.key === 'summary') + 1
    setCurrentStep(stepIndex)
  }, [setCurrentStep, generalData])

  return (
    <FunnelFlowBody>
      {generalData && resourcesData && (
        <StepSummaryPresentation
          isLoadingCreate={isCreateClusterLoading}
          isLoadingCreateAndDeploy={isCreateClusterLoading || isDeployClusterLoading}
          onSubmit={onSubmit}
          onPrevious={onBack}
          generalData={generalData}
          kubeconfigData={kubeconfigData}
          resourcesData={resourcesData}
          featuresData={featuresData}
          detailInstanceType={detailInstanceType}
          goToResources={goToResources}
          goToGeneral={goToGeneral}
          goToFeatures={goToFeatures}
          goToKubeconfig={goToKubeconfig}
          goToEksConfig={goToEksConfig}
        />
      )}
    </FunnelFlowBody>
  )
}

export default StepSummary
