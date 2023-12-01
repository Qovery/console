import {
  type ClusterCloudProviderInfo,
  type ClusterCloudProviderInfoRequest,
  type ClusterCredentials,
} from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useClusterCloudProviderInfo } from '@qovery/domains/clusters/feature'
import { postCloudProviderInfo, postClusterActionsDeploy } from '@qovery/domains/organization'
import { useCloudProviderCredentials } from '@qovery/domains/organizations/feature'
import { ToastEnum, toast } from '@qovery/shared/toast'
import { type AppDispatch } from '@qovery/state/store'
import PageSettingsCredentials from '../../ui/page-settings-credentials/page-settings-credentials'

export const handleSubmit = (
  data: FieldValues,
  credentials: ClusterCredentials[],
  cluster: ClusterCloudProviderInfo
): ClusterCloudProviderInfoRequest => {
  const currentCredentials = credentials.filter((item) => item.id === data['credentials'])[0]

  return {
    cloud_provider: cluster.cloud_provider,
    credentials: {
      id: currentCredentials.id,
      name: currentCredentials.name,
    },
    region: cluster.region,
  }
}

export function PageSettingsCredentialsFeature() {
  const { organizationId = '', clusterId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()

  const [loading, setLoading] = useState(false)

  const methods = useForm({
    mode: 'onChange',
  })

  const { data: clusterCloudProviderInfo } = useClusterCloudProviderInfo({
    organizationId,
    clusterId,
  })
  const { data: credentials = [] } = useCloudProviderCredentials({
    organizationId,
    cloudProvider: clusterCloudProviderInfo?.cloud_provider,
  })

  const onSubmit = methods.handleSubmit((data) => {
    const findCredentials = credentials.find((credential) => credential.id === data['credentials'])

    if (data && clusterCloudProviderInfo && findCredentials) {
      setLoading(true)

      const clusterCloudProviderInfoRequest = handleSubmit(data, credentials, clusterCloudProviderInfo)

      const toasterCallback = () => {
        if (clusterCloudProviderInfo) {
          dispatch(postClusterActionsDeploy({ organizationId, clusterId }))
        }
      }

      dispatch(
        postCloudProviderInfo({
          organizationId,
          clusterId,
          clusterCloudProviderInfo: clusterCloudProviderInfoRequest,
          toasterCallback,
        })
      )
        .unwrap()
        .finally(() => setLoading(false))
    } else {
      toast(ToastEnum.ERROR, 'Please select a credential')
    }
  })

  useEffect(() => {
    if (clusterCloudProviderInfo) {
      methods.setValue('credentials', clusterCloudProviderInfo.credentials?.id)
    }
  }, [methods, organizationId, clusterId, dispatch, clusterCloudProviderInfo])

  return (
    <FormProvider {...methods}>
      <PageSettingsCredentials
        onSubmit={onSubmit}
        loading={loading}
        cloudProvider={clusterCloudProviderInfo?.cloud_provider}
      />
    </FormProvider>
  )
}

export default PageSettingsCredentialsFeature
