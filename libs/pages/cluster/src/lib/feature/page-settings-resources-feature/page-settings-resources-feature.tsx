import {
  type Cluster,
  type ClusterFeatureKarpenterParametersResponse,
  type ClusterFeatureStringResponse,
  type ClusterRequestFeaturesInner,
  type KarpenterNodePool,
} from 'qovery-typescript-axios'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { SCW_CONTROL_PLANE_FEATURE_ID } from '@qovery/domains/cloud-providers/feature'
import { ClusterMigrationModal, useCluster, useEditCluster } from '@qovery/domains/clusters/feature'
import { type ClusterResourcesData, type SCWControlPlaneFeatureType } from '@qovery/shared/interfaces'
import { useModal } from '@qovery/shared/ui'
import { PageSettingsResources } from '../../ui/page-settings-resources/page-settings-resources'

// Safety measure: legacy clusters only have the cluster-level `spot_enabled` set. Copy it into
// each pool so saving the settings page (which resets the cluster-level flag to false) cannot
// silently flip pools from spot to on-demand.
export function backfillNodepoolSpot(pools: KarpenterNodePool, clusterSpot: boolean): KarpenterNodePool {
  // Widen pool types to reach `spot_enabled` — remove once the SDK types expose it on every override.
  const fill = (pool: Record<string, unknown> | undefined) =>
    pool ? { ...pool, spot_enabled: (pool['spot_enabled'] as boolean | undefined) ?? clusterSpot } : pool

  return {
    ...pools,
    stable_override: fill(pools.stable_override as Record<string, unknown> | undefined) as KarpenterNodePool['stable_override'],
    default_override: fill(pools.default_override as Record<string, unknown> | undefined) as KarpenterNodePool['default_override'],
    gpu_override: fill(pools.gpu_override as Record<string, unknown> | undefined) as KarpenterNodePool['gpu_override'],
    cronjob_override: fill(pools.cronjob_override as Record<string, unknown> | undefined) as KarpenterNodePool['cronjob_override'],
  }
}

export const handleSubmit = (data: FieldValues, cluster: Cluster): Cluster => {
  const payload = {
    ...cluster,
    max_running_nodes: data['nodes'][1],
    min_running_nodes: data['nodes'][0],
    disk_size: data['disk_size'],
    disk_iops: cluster.cloud_provider === 'AWS' ? data['disk_iops'] : undefined,
    disk_throughput: cluster.cloud_provider === 'AWS' ? data['disk_throughput'] : undefined,
    instance_type: data['instance_type'],
  }

  const hasKarpenterFeature = cluster.features?.some((f) => f.id === 'KARPENTER')

  if (data['karpenter']?.enabled && !hasKarpenterFeature) {
    payload.features = [
      ...(cluster.features || []),
      {
        id: 'KARPENTER',
        value: {
          spot_enabled: false,
          disk_size_in_gib: data['karpenter'].disk_size_in_gib,
          disk_iops: data['karpenter'].disk_iops,
          disk_throughput: data['karpenter'].disk_throughput,
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
            spot_enabled: false,
            disk_size_in_gib: data['karpenter'].disk_size_in_gib,
            disk_iops: data['karpenter'].disk_iops,
            disk_throughput: data['karpenter'].disk_throughput,
            default_service_architecture: data['karpenter'].default_service_architecture,
            qovery_node_pools: data['karpenter'].qovery_node_pools,
          },
        }
      }

      return feature
    })
  }

  if (cluster.cloud_provider === 'SCW') {
    payload.features = cluster.features?.map((feature) => {
      if (feature.id === SCW_CONTROL_PLANE_FEATURE_ID) {
        return {
          ...feature,
          value: data['scw_control_plane'],
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
  const scwFeature = cluster.features?.find(
    (feature) => feature.id === SCW_CONTROL_PLANE_FEATURE_ID
  ) as ClusterFeatureStringResponse

  const { openModal, closeModal } = useModal()

  const methods = useForm<ClusterResourcesData>({
    mode: 'onChange',
    defaultValues: {
      cluster_type: cluster.kubernetes,
      instance_type: cluster.instance_type,
      nodes: [cluster.min_running_nodes || 1, cluster.max_running_nodes || 1],
      disk_size: cluster.disk_size || 0,
      disk_iops: cluster.disk_iops,
      disk_throughput: cluster.disk_throughput,
      karpenter: karpenterFeature
        ? {
            enabled: true,
            spot_enabled: karpenterFeature.value.spot_enabled,
            disk_size_in_gib: karpenterFeature.value.disk_size_in_gib,
            disk_iops: karpenterFeature.value.disk_iops,
            disk_throughput: karpenterFeature.value.disk_throughput,
            default_service_architecture: karpenterFeature.value.default_service_architecture,
            qovery_node_pools: backfillNodepoolSpot(
              karpenterFeature.value.qovery_node_pools,
              karpenterFeature.value.spot_enabled
            ),
          }
        : {
            enabled: false,
          },
      scw_control_plane: scwFeature ? (scwFeature.value as SCWControlPlaneFeatureType) : undefined,
    },
  })
  const { mutate: editCluster, isLoading: isEditClusterLoading } = useEditCluster()

  const onSubmit = methods.handleSubmit((data) => {
    const updateCluster = () => {
      const cloneCluster = handleSubmit(data, cluster)
      editCluster({
        clusterId: cluster.id,
        organizationId: cluster.organization.id,
        clusterRequest: cloneCluster,
      })
    }

    if (data && cluster) {
      const hasKarpenterFeature = cluster.features?.some((f) => f.id === 'KARPENTER')
      if (data.karpenter?.enabled === !hasKarpenterFeature) {
        openModal({
          content: <ClusterMigrationModal onClose={closeModal} onSubmit={updateCluster} />,
        })
      } else {
        updateCluster()
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
