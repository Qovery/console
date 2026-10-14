import { createFileRoute, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { useEffect, useRef } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useCloudProviderCredentials } from '@qovery/domains/cloud-providers/feature'
import { isClusterEksManaged } from '@qovery/domains/clusters/data-access'
import {
  type ClusterCredentialsFormValues,
  ClusterCredentialsSettings,
  ClusterRestrictivePermissionsSettings,
  getCloudProviderInfoRequest,
  getClusterCredentialsSavePlan,
  saveClusterCredentials,
  useCluster,
  useClusterCloudProviderInfo,
  useDeployCluster,
  useEditCloudProviderInfo,
  useEditCluster,
} from '@qovery/domains/clusters/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { BlockContent, Button, Section, toast, useModalConfirmation } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/cluster/$clusterId/settings/credentials'
)({
  component: RouteComponent,
})

function ClusterCredentialsSettingsForm() {
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const isWideCredentialsFeatureFlagEnabled = Boolean(useFeatureFlagEnabled('wide-credentials'))

  const methods = useForm<ClusterCredentialsFormValues>({
    mode: 'onChange',
  })

  const { data: cluster } = useCluster({ organizationId, clusterId })

  const { data: clusterCloudProviderInfo } = useClusterCloudProviderInfo({
    organizationId,
    clusterId,
  })
  const { data: credentials = [] } = useCloudProviderCredentials({
    organizationId,
    cloudProvider: clusterCloudProviderInfo?.cloud_provider,
  })
  const { mutate: editCloudProviderInfo, isLoading: isEditCloudProviderInfoLoading } = useEditCloudProviderInfo()
  const {
    mutateAsync: editCloudProviderInfoWithoutUpdateAction,
    isLoading: isEditCloudProviderInfoWithoutUpdateActionLoading,
  } = useEditCloudProviderInfo({
    showClusterUpdateAction: false,
  })
  // The permissions toggle is saved without prompting for a cluster update action.
  const { mutateAsync: editCluster, isLoading: isEditClusterLoading } = useEditCluster({
    showClusterUpdateAction: false,
  })
  const { mutateAsync: editClusterSilently, isLoading: isEditClusterSilentlyLoading } = useEditCluster({
    silently: true,
  })
  const { mutateAsync: deployCluster } = useDeployCluster()
  const { openModalConfirmation } = useModalConfirmation()

  // Restrictive (dual) credentials are only available for AWS managed (EKS) clusters
  const isWideCredentialsEnabled = isWideCredentialsFeatureFlagEnabled && !!cluster && isClusterEksManaged(cluster)
  const initialUsingRestrictivePermissions = cluster?.wide_permissions?.using_restrictive_permissions ?? false
  const isSavingRef = useRef(false)

  const openRedeployConfirmation = (action: () => Promise<void>) => {
    if (!cluster) return

    openModalConfirmation({
      title: 'Confirm credentials change',
      description: 'Changing the credentials will trigger a cluster redeployment. To confirm, please type the name:',
      name: cluster.name,
      action,
    })
  }

  const onSubmit = methods.handleSubmit(async (data) => {
    // The cluster is required to know if the credentials change needs a redeploy
    if (!cluster || !clusterCloudProviderInfo) return

    const formValues = isWideCredentialsEnabled ? data : { ...data, using_restrictive_permissions: false }
    const cloudProviderInfoRequest = getCloudProviderInfoRequest(formValues, credentials, clusterCloudProviderInfo)

    if (!cloudProviderInfoRequest) {
      toast('error', 'Please select a credential')
      return
    }

    const variables = { organizationId, clusterId, cloudProviderInfoRequest }

    if (!isWideCredentialsEnabled) {
      // Changing the credentials of a managed EKS cluster requires a cluster redeploy, triggered once they are saved
      const hasCredentialsChanged = data.credentials !== clusterCloudProviderInfo.credentials?.id
      if (isClusterEksManaged(cluster) && hasCredentialsChanged) {
        openRedeployConfirmation(async () => {
          await editCloudProviderInfoWithoutUpdateAction(variables)
          await deployCluster({ organizationId, clusterId })
        })
      } else {
        editCloudProviderInfo(variables)
      }
      return
    }

    const plan = getClusterCredentialsSavePlan({
      formValues,
      cloudProviderInfo: clusterCloudProviderInfo,
      initialUsingRestrictivePermissions,
    })

    const save = async () => {
      // The cluster and its credentials are refetched one after the other: syncing the form from each refetch would
      // briefly show a mix of old and new values, so the form is reset once with the saved values instead
      isSavingRef.current = true
      try {
        await saveClusterCredentials({
          plan,
          // A single toast is shown when the credentials are saved too
          editCluster: () =>
            (plan.shouldEditCloudProviderInfo ? editClusterSilently : editCluster)({
              organizationId,
              clusterId,
              clusterRequest: {
                ...cluster,
                wide_permissions: { using_restrictive_permissions: Boolean(formValues.using_restrictive_permissions) },
              },
            }),
          // Credential changes are followed by a redeploy when required; toggle and wide credential changes don't
          // offer a separate cluster update action.
          editCloudProviderInfo: () => editCloudProviderInfoWithoutUpdateAction(variables),
          deployCluster: () => deployCluster({ organizationId, clusterId }),
        })
        const usingRestrictivePermissions = Boolean(formValues.using_restrictive_permissions)
        methods.reset(
          isWideCredentialsEnabled
            ? {
                configured_credentials: formValues.configured_credentials,
                restricted_credentials: usingRestrictivePermissions ? formValues.restricted_credentials : undefined,
                using_restrictive_permissions: usingRestrictivePermissions,
              }
            : { credentials: formValues.credentials, using_restrictive_permissions: false }
        )
      } finally {
        isSavingRef.current = false
      }
    }

    if (plan.shouldRedeploy) {
      openRedeployConfirmation(save)
    } else {
      try {
        await save()
      } catch (error) {
        // Errors are already notified by the mutations
        console.error(error)
      }
    }
  })

  useEffect(() => {
    if (clusterCloudProviderInfo && !isSavingRef.current) {
      // Map the API credentials back into the stable configured/restricted form fields for the current mode.
      methods.reset(
        isWideCredentialsEnabled
          ? {
              configured_credentials: initialUsingRestrictivePermissions
                ? clusterCloudProviderInfo.wide_permission_credentials?.id
                : clusterCloudProviderInfo.credentials?.id,
              restricted_credentials: initialUsingRestrictivePermissions
                ? clusterCloudProviderInfo.credentials?.id
                : undefined,
              using_restrictive_permissions: initialUsingRestrictivePermissions,
            }
          : {
              credentials: clusterCloudProviderInfo.credentials?.id,
              using_restrictive_permissions: false,
            }
      )
    }
  }, [methods, clusterCloudProviderInfo, initialUsingRestrictivePermissions, isWideCredentialsEnabled])

  return (
    <FormProvider {...methods}>
      <div className="flex w-full flex-col justify-between">
        <Section className="p-8">
          <SettingsHeading title="Credentials" />
          <div className="max-w-content-with-navigation-left">
            <form onSubmit={onSubmit}>
              {isWideCredentialsEnabled ? (
                <ClusterRestrictivePermissionsSettings cloudProvider={clusterCloudProviderInfo?.cloud_provider} />
              ) : (
                <BlockContent title="Configured credentials">
                  <ClusterCredentialsSettings
                    cloudProvider={clusterCloudProviderInfo?.cloud_provider}
                    isSetting={true}
                  />
                </BlockContent>
              )}
              <div className="flex justify-end">
                <Button
                  data-testid="submit-button"
                  type="submit"
                  size="lg"
                  loading={
                    isEditCloudProviderInfoLoading ||
                    isEditCloudProviderInfoWithoutUpdateActionLoading ||
                    isEditClusterLoading ||
                    isEditClusterSilentlyLoading
                  }
                  disabled={!methods.formState.isValid || !cluster}
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
