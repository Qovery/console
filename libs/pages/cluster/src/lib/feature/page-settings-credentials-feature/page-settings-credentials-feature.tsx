import {
  type ClusterCloudProviderInfo,
  type ClusterCloudProviderInfoRequest,
  type ClusterCredentials,
} from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  fetchCloudProviderInfo,
  postCloudProviderInfo,
  postClusterActionsDeploy,
  selectClusterById,
  selectClustersLoadingStatus,
} from '@qovery/domains/organization'
import { useCloudProviderCredentials } from '@qovery/domains/organizations/feature'
import { type ClusterEntity } from '@qovery/shared/interfaces'
import { ToastEnum, toast } from '@qovery/shared/toast'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import PageSettingsCredentials from '../../ui/page-settings-credentials/page-settings-credentials'

export const handleSubmit = (data: FieldValues, credentials?: ClusterCredentials[], cluster?: ClusterEntity) => {
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
  const clustersLoading = useSelector((state: RootState) => selectClustersLoadingStatus(state))

  const { data: credentials = [] } = useCloudProviderCredentials({
    organizationId,
    cloudProvider: methods.getValues('credentials'),
  })

  const onSubmit = methods.handleSubmit((data) => {
    const findCredentials = credentials.find((credential) => credential.id === data['credentials'])

    if (data && cluster && findCredentials) {
      setLoading(true)

      const clusterCloudProviderInfo = handleSubmit(data, credentials, cluster) as ClusterCloudProviderInfoRequest

      const toasterCallback = () => {
        if (cluster) {
          dispatch(postClusterActionsDeploy({ organizationId, clusterId }))
        }
      }

      dispatch(postCloudProviderInfo({ organizationId, clusterId, clusterCloudProviderInfo, toasterCallback }))
        .unwrap()
        .finally(() => setLoading(false))
    } else {
      toast(ToastEnum.ERROR, 'Please select a credential')
    }
  })

  useEffect(() => {
    if (cluster?.cloudProviderInfo?.loadingStatus !== 'error') {
      if (clustersLoading === 'loaded' && cluster?.cloudProviderInfo?.loadingStatus !== 'loaded') {
        dispatch(fetchCloudProviderInfo({ organizationId, clusterId }))
          .unwrap()
          .then((result: ClusterCloudProviderInfo) => methods.setValue('credentials', result.credentials?.id))
          .catch((error) => console.log(error))
      } else {
        methods.setValue('credentials', cluster?.cloudProviderInfo?.item?.credentials?.id)
      }
    }
  }, [clustersLoading, methods, organizationId, clusterId, dispatch, cluster?.cloudProviderInfo])

  return (
    <FormProvider {...methods}>
      <PageSettingsCredentials onSubmit={onSubmit} loading={loading} cloudProvider={cluster?.cloud_provider} />
    </FormProvider>
  )
}

export default PageSettingsCredentialsFeature
