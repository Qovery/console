import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editCluster, selectClusterById } from '@qovery/domains/organization'
import { ClusterEntity, ClusterRemoteData } from '@qovery/shared/interfaces'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsRemote from '../../ui/page-settings-remote/page-settings-remote'

export const handleSubmit = (data: ClusterRemoteData, cluster: ClusterEntity): ClusterEntity => {
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

  const cluster = useSelector<RootState, ClusterEntity | undefined>((state) => selectClusterById(state, clusterId))

  const onSubmit = methods.handleSubmit((data) => {
    if (data && cluster) {
      setLoading(true)

      const cloneCluster = handleSubmit(data, cluster)

      dispatch(
        editCluster({
          organizationId: organizationId,
          clusterId: clusterId,
          data: cloneCluster,
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
