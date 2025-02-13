import {
  type Cluster,
  type ClusterFeatureKarpenterParametersResponse,
  type ClusterRequestFeaturesInner,
} from 'qovery-typescript-axios'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import {
  ClusterMigrationModal,
  useCluster,
  useEditCluster,
  useUpdateKarpenterPrivateFargate,
} from '@qovery/domains/clusters/feature'
import { type ClusterResourcesEdit } from '@qovery/shared/interfaces'
import { useModal } from '@qovery/shared/ui'
import { PageSettingsResources } from '../../ui/page-settings-resources/page-settings-resources'

function getValueByKey(key: string, data: { [key: string]: string }[] = []): string[] {
  return data.filter((obj) => key in obj).map((obj) => obj[key])
}

export const handleSubmit = (data: FieldValues, cluster: Cluster): Cluster => {
  const payload = {
    ...cluster,
    max_running_nodes: data['nodes'][1],
    min_running_nodes: data['nodes'][0],
    disk_size: data['disk_size'],
    instance_type: data['instance_type'],
  }

  const hasKarpenterFeature = cluster.features?.some((f) => f.id === 'KARPENTER')

  if (data['karpenter']?.enabled && !hasKarpenterFeature) {
    payload.features = [
      ...(cluster.features || []),
      {
        id: 'KARPENTER',
        value: {
          spot_enabled: data['karpenter'].spot_enabled ?? false,
          disk_size_in_gib: data['karpenter'].disk_size_in_gib,
          default_service_architecture: data['karpenter'].default_service_architecture,
          qovery_node_pools: data['karpenter'].qovery_node_pools,
        },
      } as ClusterRequestFeaturesInner,
    ]
  } else {
    payload.features = cluster.features?.map((feature) => {
      if (feature.id === 'KARPENTER') {
        return {
          ...feature,
          value: {
            spot_enabled: data['karpenter'].spot_enabled ?? false,
            disk_size_in_gib: data['karpenter'].disk_size_in_gib,
            default_service_architecture: data['karpenter'].default_service_architecture,
            qovery_node_pools: data['karpenter'].qovery_node_pools,
          },
        }
      }

      return feature
    })
  }

  return payload
}

export interface SettingsResourcesFeatureProps {
  cluster: Cluster
}

function SettingsResourcesFeature({ cluster }: SettingsResourcesFeatureProps) {
  const karpenterFeature = cluster.features?.find(
    (feature) => feature.id === 'KARPENTER'
  ) as ClusterFeatureKarpenterParametersResponse
  const { openModal, closeModal } = useModal()

  const methods = useForm<ClusterResourcesEdit>({
    mode: 'onChange',
    defaultValues: {
      cluster_type: cluster.kubernetes,
      instance_type: cluster.instance_type,
      nodes: [cluster.min_running_nodes || 1, cluster.max_running_nodes || 1],
      disk_size: cluster.disk_size || 0,
      karpenter: karpenterFeature
        ? {
            enabled: true,
            spot_enabled: karpenterFeature.value.spot_enabled,
            disk_size_in_gib: karpenterFeature.value.disk_size_in_gib,
            default_service_architecture: karpenterFeature.value.default_service_architecture,
            qovery_node_pools: karpenterFeature.value.qovery_node_pools,
          }
        : {
            enabled: false,
          },
    },
  })
  const { mutate: editCluster, isLoading: isEditClusterLoading } = useEditCluster()
  const { mutateAsync: updateKarpenterPrivateFargate } = useUpdateKarpenterPrivateFargate()

  const onSubmit = methods.handleSubmit(async (data) => {
    const updateCluster = async () => {
      const cloneCluster = handleSubmit(data, cluster)
      editCluster({
        clusterId: cluster.id,
        organizationId: cluster.organization.id,
        clusterRequest: cloneCluster,
      })
    }

    const updateClusterKarpenterSubnets = async () => {
      if (data?.aws_existing_vpc?.eks_subnets) {
        try {
          await updateKarpenterPrivateFargate({
            organizationId: cluster.organization.id,
            clusterId: cluster.id,
            clusterKarpenterPrivateSubnetIdsPutRequest: {
              eks_karpenter_fargate_subnets_zone_a_ids: getValueByKey('A', data?.aws_existing_vpc?.eks_subnets)!,
              eks_karpenter_fargate_subnets_zone_b_ids: getValueByKey('B', data?.aws_existing_vpc?.eks_subnets)!,
              eks_karpenter_fargate_subnets_zone_c_ids: getValueByKey('C', data?.aws_existing_vpc?.eks_subnets)!,
            },
          })
          await updateCluster()
        } catch (error) {
          console.error(error)
        }
      } else {
        await updateCluster()
      }
    }

    if (data && cluster) {
      const hasKarpenterFeature = cluster.features?.some((f) => f.id === 'KARPENTER')
      if (data.karpenter?.enabled === !hasKarpenterFeature) {
        openModal({
          content: <ClusterMigrationModal onClose={closeModal} onSubmit={updateClusterKarpenterSubnets} />,
        })
      } else {
        await updateClusterKarpenterSubnets()
      }
    }
  })

  return (
    <FormProvider {...methods}>
      {cluster && <PageSettingsResources cluster={cluster} onSubmit={onSubmit} loading={isEditClusterLoading} />}
    </FormProvider>
  )
}

export function PageSettingsResourcesFeature() {
  const { organizationId = '', clusterId = '' } = useParams()

  const { data: cluster } = useCluster({ organizationId, clusterId })

  if (!cluster) return null

  return <SettingsResourcesFeature cluster={cluster} />
}

export default PageSettingsResourcesFeature
