import { createFileRoute, useParams } from '@tanstack/react-router'
import {
  type ClusterCloudProviderInfo,
  type ClusterCloudProviderInfoRequest,
  type ClusterCredentials,
} from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useCloudProviderCredentials } from '@qovery/domains/cloud-providers/feature'
import { useClusterCloudProviderInfo, useEditCloudProviderInfo } from '@qovery/domains/clusters/feature'
import { ClusterCredentialsSettingsFeature, SettingsHeading } from '@qovery/shared/console-shared'
import { ToastEnum, toast } from '@qovery/shared/toast'
import { BlockContent, Button, Section } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/cluster/$clusterId/settings/credentials'
)({
  component: RouteComponent,
})

const handleSubmit = (
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

function ClusterCredentialsSettingsForm() {
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })

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
  }, [methods, clusterCloudProviderInfo])

  return (
    <FormProvider {...methods}>
      <div className="flex w-full flex-col justify-between">
        <Section className="p-8">
          <SettingsHeading title="Credentials" />
          <div className="max-w-content-with-navigation-left">
            <form onSubmit={onSubmit}>
              <BlockContent title="Configured credentials">
                <ClusterCredentialsSettingsFeature
                  cloudProvider={clusterCloudProviderInfo?.cloud_provider}
                  isSetting={true}
                />
              </BlockContent>
              <div className="flex justify-end">
                <Button
                  data-testid="submit-button"
                  type="submit"
                  size="lg"
                  loading={isEditCloudProviderInfoLoading}
                  disabled={!methods.formState.isValid}
                >
                  Save
                </Button>
              </div>
            </form>
          </div>
        </Section>
      </div>
    </FormProvider>
  )
}

function RouteComponent() {
  return <ClusterCredentialsSettingsForm />
}
