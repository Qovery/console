import { type Cluster } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useCluster } from '@qovery/domains/clusters/feature'
import { editCluster, postClusterActionsDeploy } from '@qovery/domains/organization'
import { type ClusterRemoteData } from '@qovery/shared/interfaces'
import { type AppDispatch } from '@qovery/state/store'
import PageSettingsRemote from '../../ui/page-settings-remote/page-settings-remote'

export const handleSubmit = (data: ClusterRemoteData, cluster: Cluster): Cluster => {
  return {
    ...cluster,
    ssh_keys: [data['ssh_key']],
  }
}

export function PageSettingsRemoteFeature() {
  const { organizationId = '', clusterId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()

  const [loading, setLoading] = useState(false)

  const methods = useForm<ClusterRemoteData>({
    mode: 'onChange',
  })

  const { data: cluster } = useCluster({ organizationId, clusterId })

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
          organizationId,
          clusterId,
          data: cloneCluster,
          toasterCallback,
        })
      )
        .unwrap()
        .then(() => setLoading(false))
        .catch(() => setLoading(false))
    }
  })

  useEffect(() => {
    methods.setValue('ssh_key', cluster?.ssh_keys ? cluster.ssh_keys[0] : '')
  }, [methods, cluster?.ssh_keys])

  return (
    <FormProvider {...methods}>
      <PageSettingsRemote onSubmit={onSubmit} loading={loading} />
    </FormProvider>
  )
}

export default PageSettingsRemoteFeature
