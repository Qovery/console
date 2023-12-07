import { type Cluster } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useCluster, useEditCluster } from '@qovery/domains/clusters/feature'
import { type ClusterRemoteData } from '@qovery/shared/interfaces'
import PageSettingsRemote from '../../ui/page-settings-remote/page-settings-remote'

export const handleSubmit = (data: ClusterRemoteData, cluster: Cluster): Cluster => {
  return {
    ...cluster,
    ssh_keys: [data['ssh_key']],
  }
}

export function PageSettingsRemoteFeature() {
  const { organizationId = '', clusterId = '' } = useParams()

  const methods = useForm<ClusterRemoteData>({
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
    methods.setValue('ssh_key', cluster?.ssh_keys ? cluster.ssh_keys[0] : '')
  }, [methods, cluster?.ssh_keys])

  return (
    <FormProvider {...methods}>
      <PageSettingsRemote onSubmit={onSubmit} loading={isEditClusterLoading} />
    </FormProvider>
  )
}

export default PageSettingsRemoteFeature
