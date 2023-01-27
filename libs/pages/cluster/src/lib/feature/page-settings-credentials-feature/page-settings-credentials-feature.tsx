import { ClusterCloudProviderInfo, ClusterCloudProviderInfoRequest } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  fetchCloudProviderInfo,
  getClusterState,
  postCloudProviderInfo,
  selectClusterById,
  selectOrganizationById,
} from '@qovery/domains/organization'
import { ClusterCredentialsEntity, ClusterEntity } from '@qovery/shared/interfaces'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsCredentials from '../../ui/page-settings-credentials/page-settings-credentials'

export const handleSubmit = (data: FieldValues, credentials?: ClusterCredentialsEntity[], cluster?: ClusterEntity) => {
  const currentCredentials = credentials?.filter((item) => item.id === data['credentials'])[0]

  return {
    cloud_provider: cluster?.cloud_provider,
    credentials: {
      id: currentCredentials?.id,
      name: currentCredentials?.name,
    },
    region: cluster?.region,
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
  const clusterLoadingStatus = useSelector((state: RootState) => getClusterState(state).loadingStatus)

  const credentials = useSelector<RootState, ClusterCredentialsEntity[] | undefined>(
    (state) => selectOrganizationById(state, organizationId)?.credentials?.items
  )

  const onSubmit = methods.handleSubmit((data) => {
    if (data && cluster) {
      setLoading(true)

      const clusterCloudProviderInfo = handleSubmit(data, credentials, cluster) as ClusterCloudProviderInfoRequest

      dispatch(postCloudProviderInfo({ organizationId, clusterId, clusterCloudProviderInfo }))
        .unwrap()
        .then(() => setLoading(false))
        .catch(() => setLoading(false))
    }
  })

  useEffect(() => {
    if (clusterLoadingStatus === 'not loaded')
      dispatch(fetchCloudProviderInfo({ organizationId, clusterId }))
        .unwrap()
        .then((result: ClusterCloudProviderInfo) => methods.setValue('credentials', result.credentials?.id))
  }, [clusterLoadingStatus, methods, organizationId, clusterId, dispatch])

  return (
    <FormProvider {...methods}>
      <PageSettingsCredentials onSubmit={onSubmit} loading={loading} cloudProvider={cluster?.cloud_provider} />
    </FormProvider>
  )
}

export default PageSettingsCredentialsFeature
