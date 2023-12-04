import { type Cluster } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useCluster, useEditCluster } from '@qovery/domains/clusters/feature'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import PageSettingsResources from '../../ui/page-settings-resources/page-settings-resources'

export const handleSubmit = (data: FieldValues, cluster: Cluster): Cluster => {
  return {
    ...cluster,
    max_running_nodes: data['nodes'][1],
    min_running_nodes: data['nodes'][0],
    disk_size: data['disk_size'],
    instance_type: data['instance_type'],
  }
}

export function PageSettingsResourcesFeature() {
  const { organizationId = '', clusterId = '' } = useParams()

  const methods = useForm<ClusterResourcesData>({
    mode: 'onChange',
  })
  const { data: cluster } = useCluster({ organizationId, clusterId })
  const { mutateAsync: editCluster, isLoading: isEditClusterLoading } = useEditCluster()

  const onSubmit = methods.handleSubmit((data) => {
    if (data && cluster) {
      const cloneCluster = handleSubmit(data, cluster)

      editCluster({
        organizationId,
        clusterId,
        clusterRequest: cloneCluster,
      })
    }
  })

  useEffect(() => {
    methods.setValue('cluster_type', cluster?.kubernetes || '')
    methods.setValue('instance_type', cluster?.instance_type || '')
    methods.setValue('nodes', [cluster?.min_running_nodes || 1, cluster?.max_running_nodes || 1])
    methods.setValue('disk_size', cluster?.disk_size || 0)
  }, [
    methods,
    cluster?.kubernetes,
    cluster?.instance_type,
    cluster?.min_running_nodes,
    cluster?.max_running_nodes,
    cluster?.disk_size,
  ])

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

export default PageSettingsResourcesFeature
