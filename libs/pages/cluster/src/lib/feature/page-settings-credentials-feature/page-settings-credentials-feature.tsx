import { ClusterCloudProviderInfo } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { fetchCloudProviderInfo, selectClusterById } from '@qovery/domains/organization'
import { ClusterEntity } from '@qovery/shared/interfaces'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsCredentials from '../../ui/page-settings-credentials/page-settings-credentials'

export const handleSubmit = (data: FieldValues, cluster: ClusterEntity) => {
  return {
    ...cluster,
    name: data['name'],
  }
}

export function PageSettingsCredentialsFeature() {
  const { organizationId = '', clusterId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()

  const [loading, setLoading] = useState(false)

  const methods = useForm({
    mode: 'onChange',
  })

  const cluster = useSelector<RootState, ClusterEntity | undefined>((state) => selectClusterById(state, clusterId))

  const onSubmit = methods.handleSubmit((data) => {
    if (data && cluster) {
      setLoading(true)

      // const cloneCluster = handleSubmit(data, cluster)

      // dispatch(
      //   editCredentials({
      //     organizationId: organizationId,
      //     credentialsId: clusterId,
      //     credentials: {},
      //   })
      // )
      //   .unwrap()
      //   .then(() => setLoading(false))
      //   .catch(() => setLoading(false))
    }
  })

  useEffect(() => {
    dispatch(fetchCloudProviderInfo({ organizationId, clusterId }))
      .unwrap()
      .then((result: ClusterCloudProviderInfo) => methods.setValue('credentials', result.credentials?.id))
  }, [methods, organizationId, clusterId, dispatch])

  return (
    <FormProvider {...methods}>
      <PageSettingsCredentials onSubmit={onSubmit} loading={loading} cloudProvider={cluster?.cloud_provider} />
    </FormProvider>
  )
}

export default PageSettingsCredentialsFeature
