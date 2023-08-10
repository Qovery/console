import { useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editCluster, postClusterActionsDeploy, selectClusterById } from '@qovery/domains/organization'
import { ClusterEntity, ClusterResourcesData } from '@qovery/shared/interfaces'
import { AppDispatch, RootState } from '@qovery/state/store'
import PageSettingsResources from '../../ui/page-settings-resources/page-settings-resources'

export const handleSubmit = (data: FieldValues, cluster: ClusterEntity): Partial<ClusterEntity> => {
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
  const dispatch = useDispatch<AppDispatch>()

  const [loading, setLoading] = useState(false)

  const methods = useForm<ClusterResourcesData>({
    mode: 'onChange',
  })
  const cluster = useSelector<RootState, ClusterEntity | undefined>((state) => selectClusterById(state, clusterId))

  const onSubmit = methods.handleSubmit((data) => {
    if (data && cluster) {
      setLoading(true)

      const cloneCluster = handleSubmit(data, cluster)

      const toasterCallback = () => {
        if (cluster) {
          dispatch(postClusterActionsDeploy({ organizationId, clusterId }))
        }
      }

      dispatch(
        editCluster({
          organizationId: organizationId,
          clusterId: clusterId,
          data: cloneCluster,
          toasterCallback,
        })
      )
        .unwrap()
        .finally(() => setLoading(false))
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
          cloudProvider={cluster?.cloud_provider}
          clusterRegion={cluster?.region}
          onSubmit={onSubmit}
          loading={loading}
        />
      )}
    </FormProvider>
  )
}

export default PageSettingsResourcesFeature
