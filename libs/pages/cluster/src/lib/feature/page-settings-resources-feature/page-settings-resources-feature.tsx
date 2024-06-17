import { type Cluster, type ClusterFeatureKarpenterParametersResponse } from 'qovery-typescript-axios'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useCluster, useEditCluster } from '@qovery/domains/clusters/feature'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import PageSettingsResources from '../../ui/page-settings-resources/page-settings-resources'

export const handleSubmit = (data: FieldValues, cluster: Cluster): Cluster => {
  const payload = {
    ...cluster,
    max_running_nodes: data['nodes'][1],
    min_running_nodes: data['nodes'][0],
    disk_size: data['disk_size'],
    instance_type: data['instance_type'],
  }

  payload.features = cluster.features?.map((feature) => {
    if (feature.id === 'KARPENTER') {
      return {
        ...feature,
        value: {
          spot_enabled: data['karpenter'].spot_enabled,
          disk_size_in_gib: parseInt(data['karpenter'].disk_size_in_gib),
          default_service_architecture: data['karpenter'].default_service_architecture,
        },
      }
    }

    return feature
  })

  return payload
}

export interface SettingsResourcesFeatureProps {
  cluster: Cluster
}

function SettingsResourcesFeature({ cluster }: SettingsResourcesFeatureProps) {
  const karpenterFeature = cluster.features?.find(
    (feature) => feature.id === 'KARPENTER'
  ) as ClusterFeatureKarpenterParametersResponse

  const methods = useForm<ClusterResourcesData>({
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
            disk_size_in_gib: karpenterFeature.value.disk_size_in_gib.toString(),
            default_service_architecture: karpenterFeature.value.default_service_architecture,
          }
        : {
            enabled: false,
          },
    },
  })
  const { mutate: editCluster, isLoading: isEditClusterLoading } = useEditCluster()

  const onSubmit = methods.handleSubmit((data) => {
    if (data && cluster) {
      const cloneCluster = handleSubmit(data, cluster)

      editCluster({
        clusterId: cluster.id,
        organizationId: cluster.organization.id,
        clusterRequest: cloneCluster,
      })
    }
  })

  return (
    <FormProvider {...methods}>
      {cluster && (
        <PageSettingsResources
          cloudProvider={cluster.cloud_provider}
          clusterRegion={cluster.region}
          onSubmit={onSubmit}
          loading={isEditClusterLoading}
        />
      )}
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
