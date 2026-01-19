import { createFileRoute, useParams } from '@tanstack/react-router'
import {
  type Cluster,
  type ClusterFeatureKarpenterParametersResponse,
  type ClusterFeatureStringResponse,
  type ClusterRequestFeaturesInner,
} from 'qovery-typescript-axios'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { SCW_CONTROL_PLANE_FEATURE_ID } from '@qovery/domains/cloud-providers/feature'
import {
  ClusterMigrationModal,
  ClusterResourcesSettings,
  useCluster,
  useEditCluster,
  useUpdateKarpenterPrivateFargate,
} from '@qovery/domains/clusters/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { type ClusterResourcesEdit, type SCWControlPlaneFeatureType } from '@qovery/shared/interfaces'
import { Button, Section, useModal } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/cluster/$clusterId/settings/resources'
)({
  component: RouteComponent,
})

function getValueByKey(key: string, data: { [key: string]: string }[] = []): string[] {
  return data.filter((obj) => key in obj).map((obj) => obj[key])
}

const handleSubmit = (data: FieldValues, cluster: Cluster): Cluster => {
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

function ClusterResourcesSettingsForm({ cluster }: { cluster: Cluster }) {
  const { organizationId, clusterId } = useParams({ strict: false })
  const karpenterFeature = cluster.features?.find(
    (feature) => feature.id === 'KARPENTER'
  ) as ClusterFeatureKarpenterParametersResponse
  const scwFeature = cluster.features?.find(
    (feature) => feature.id === SCW_CONTROL_PLANE_FEATURE_ID
  ) as ClusterFeatureStringResponse

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
      scw_control_plane: scwFeature ? (scwFeature.value as SCWControlPlaneFeatureType) : undefined,
    },
  })
  const { mutate: editCluster, isLoading: isEditClusterLoading } = useEditCluster()
  const { mutateAsync: updateKarpenterPrivateFargate } = useUpdateKarpenterPrivateFargate()

  const onSubmit = methods.handleSubmit(async (data) => {
    const updateCluster = async () => {
      const cloneCluster = handleSubmit(data, cluster)
      editCluster({
        clusterId: cluster.id,
        organizationId: organizationId || '',
        clusterRequest: cloneCluster,
      })
    }

    const updateClusterKarpenterSubnets = async () => {
      if (data?.aws_existing_vpc?.eks_subnets) {
        try {
          await updateKarpenterPrivateFargate({
            organizationId: organizationId || '',
            clusterId: clusterId || '',
            clusterKarpenterPrivateSubnetIdsPutRequest: {
              eks_karpenter_fargate_subnets_zone_a_ids: getValueByKey('A', data.aws_existing_vpc.eks_subnets),
              eks_karpenter_fargate_subnets_zone_b_ids: getValueByKey('B', data.aws_existing_vpc.eks_subnets),
              eks_karpenter_fargate_subnets_zone_c_ids: getValueByKey('C', data.aws_existing_vpc.eks_subnets),
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

  const hasAlreadyKarpenter = cluster.features?.some((f) => f.id === 'KARPENTER')

  return (
    <FormProvider {...methods}>
      <div className="flex w-full flex-col justify-between">
        <Section className="p-8">
          <SettingsHeading title="Resources settings" />
          <form onSubmit={onSubmit} className="max-w-content-with-navigation-left">
            <ClusterResourcesSettings
              cluster={cluster}
              cloudProvider={cluster.cloud_provider}
              clusterRegion={cluster.region}
              isProduction={cluster.production}
              hasAlreadyKarpenter={hasAlreadyKarpenter}
              fromDetail
            />
            <div className="mt-10 flex justify-end">
              <Button
                data-testid="submit-button"
                type="submit"
                size="lg"
                loading={isEditClusterLoading}
                disabled={hasAlreadyKarpenter && !methods.formState.isValid}
              >
                Save
              </Button>
            </div>
          </form>
        </Section>
      </div>
    </FormProvider>
  )
}

function RouteComponent() {
  const { organizationId, clusterId } = useParams({ strict: false })
  const { data: cluster } = useCluster({ organizationId, clusterId })

  if (!cluster) {
    return null
  }

  return <ClusterResourcesSettingsForm cluster={cluster} />
}
