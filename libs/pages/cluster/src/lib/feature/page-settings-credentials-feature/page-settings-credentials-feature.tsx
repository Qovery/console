import {
  type ClusterCloudProviderInfo,
  type ClusterCloudProviderInfoRequest,
  type ClusterCredentials,
} from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useCloudProviderCredentials } from '@qovery/domains/cloud-providers/feature'
import { useClusterCloudProviderInfo, useEditCloudProviderInfo } from '@qovery/domains/clusters/feature'
import { ToastEnum, toast } from '@qovery/shared/toast'
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
  const { mutateAsync: editCloudProviderInfo, isLoading: isEditCloudProviderInfoLoading } = useEditCloudProviderInfo()

  const onSubmit = methods.handleSubmit((data) => {
    const findCredentials = credentials.find((credential) => credential.id === data['credentials'])

    if (data && clusterCloudProviderInfo && findCredentials) {
      const clusterCloudProviderInfoRequest = handleSubmit(data, credentials, clusterCloudProviderInfo)

      editCloudProviderInfo({
        organizationId,
        clusterId,
        cloudProviderInfoRequest: clusterCloudProviderInfoRequest,
      })
    } else {
      toast(ToastEnum.ERROR, 'Please select a credential')
    }
  })

  useEffect(() => {
    if (clusterCloudProviderInfo) {
      methods.setValue('credentials', clusterCloudProviderInfo.credentials?.id)
    }
  }, [methods, organizationId, clusterId, clusterCloudProviderInfo])

  return (
    <FormProvider {...methods}>
      <PageSettingsCredentials
        onSubmit={onSubmit}
        loading={isEditCloudProviderInfoLoading}
        cloudProvider={clusterCloudProviderInfo?.cloud_provider}
      />
    </FormProvider>
  )
}

export default PageSettingsCredentialsFeature
