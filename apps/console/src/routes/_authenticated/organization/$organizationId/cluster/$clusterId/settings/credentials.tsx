import { createFileRoute, useParams } from '@tanstack/react-router'
import {
  type ClusterCloudProviderInfo,
  type ClusterCloudProviderInfoRequest,
  type ClusterCredentials,
} from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useCloudProviderCredentials } from '@qovery/domains/cloud-providers/feature'
import {
  ClusterCredentialsSettings,
  useCluster,
  useClusterCloudProviderInfo,
  useEditCloudProviderInfo,
} from '@qovery/domains/clusters/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { BlockContent, Button, Section, toast, useModalConfirmation } from '@qovery/shared/ui'

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

  const { data: cluster } = useCluster({ organizationId, clusterId })
  const isEks = cluster?.cloud_provider === 'AWS' && cluster?.kubernetes === 'MANAGED'

  const { data: clusterCloudProviderInfo } = useClusterCloudProviderInfo({
    organizationId,
    clusterId,
  })
  const { data: credentials = [] } = useCloudProviderCredentials({
    organizationId,
    cloudProvider: clusterCloudProviderInfo?.cloud_provider,
  })
  const { mutateAsync: editCloudProviderInfo, isLoading: isEditCloudProviderInfoLoading } = useEditCloudProviderInfo()
  const { mutateAsync: editCloudProviderInfoAndRedeploy } = useEditCloudProviderInfo({ redeployOnSuccess: true })
  const { openModalConfirmation } = useModalConfirmation()

  const onSubmit = methods.handleSubmit((data) => {
    const findCredentials = credentials.find((credential) => credential.id === data['credentials'])

    if (data && clusterCloudProviderInfo && findCredentials) {
      const variables = {
        organizationId,
        clusterId,
        cloudProviderInfoRequest: handleSubmit(data, credentials, clusterCloudProviderInfo),
      }

      // Changing the credentials of a managed EKS cluster requires a cluster redeploy, triggered once they are saved
      const hasCredentialsChanged = findCredentials.id !== clusterCloudProviderInfo.credentials?.id
      if (isEks && hasCredentialsChanged) {
        openModalConfirmation({
          title: 'Confirm credentials change',
          description:
            'Changing the credentials will trigger a cluster redeployment. To confirm, please type the name:',
          warning: 'Your cluster will be redeployed automatically once the new credentials are saved.',
          name: cluster?.name,
          action: async () => {
            await editCloudProviderInfoAndRedeploy(variables)
          },
        })
      } else {
        editCloudProviderInfo(variables)
      }
    } else {
      toast('error', 'Please select a credential')
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
                <ClusterCredentialsSettings
                  cloudProvider={clusterCloudProviderInfo?.cloud_provider}
                  isSetting={true}
                  isEks={isEks}
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
