import { createFileRoute, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type Cluster, type ClusterCloudProviderInfo } from 'qovery-typescript-axios'
import { useEffect, useRef } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useCloudProviderCredentials } from '@qovery/domains/cloud-providers/feature'
import { isClusterEksManaged } from '@qovery/domains/clusters/data-access'
import {
  type ClusterCredentialsFormValues,
  ClusterCredentialsSettings,
  ClusterRestrictivePermissionsSettings,
  getCloudProviderInfoRequest,
  getClusterCredentialsFormValuesAfterSave,
  getWidePermissionsRequest,
  useCluster,
  useClusterCloudProviderInfo,
  useDeployCluster,
  useEditCloudProviderInfo,
  useEditCluster,
} from '@qovery/domains/clusters/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, Section, toast, useModalConfirmation } from '@qovery/shared/ui'

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

  const { data: cluster, isFetching: isClusterFetching } = useCluster({ organizationId, clusterId })

  const { data: clusterCloudProviderInfo, isFetching: isCloudProviderInfoFetching } = useClusterCloudProviderInfo({
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
  const formMode = isWideCredentialsEnabled ? 'wide' : 'legacy'
  const formInitializationKey = `${organizationId}:${clusterId}:${formMode}`
  const initialUsingRestrictivePermissions = cluster?.wide_permissions?.using_restrictive_permissions ?? false
  const initializedFormKeyRef = useRef<string | undefined>(undefined)

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

    const usingRestrictivePermissions = Boolean(formValues.using_restrictive_permissions)
    const hasCredentialsChanged = cloudProviderInfoRequest.credentials.id !== clusterCloudProviderInfo.credentials?.id
    const hasWidePermissionCredentialsChanged =
      usingRestrictivePermissions &&
      cloudProviderInfoRequest.wide_permission_credentials?.id !==
        clusterCloudProviderInfo.wide_permission_credentials?.id
    const hasSlackWebhookChanged =
      (usingRestrictivePermissions ? formValues.slack_webhook_url?.trim() || null : null) !==
      (cluster.wide_permissions?.slack_webhook_url?.trim() || null)
    // Saving with restrictive permissions off sends explicit nulls to clear the wide-permission settings.
    const shouldEditCluster =
      !usingRestrictivePermissions ||
      usingRestrictivePermissions !== initialUsingRestrictivePermissions ||
      hasSlackWebhookChanged
    const plan = {
      shouldEditCluster,
      shouldEditCloudProviderInfo: hasCredentialsChanged || hasWidePermissionCredentialsChanged || !shouldEditCluster,
      shouldRedeploy: hasCredentialsChanged,
    }

    const save = async () => {
      let editedCluster: Cluster | undefined
      let editedCloudProviderInfo: ClusterCloudProviderInfo | undefined

      if (plan.shouldEditCluster) {
        editedCluster = await (plan.shouldEditCloudProviderInfo ? editClusterSilently : editCluster)({
          organizationId,
          clusterId,
          clusterRequest: {
            ...cluster,
            wide_permissions: getWidePermissionsRequest(formValues, cluster.wide_permissions),
          },
        })
      }

      // Credential changes are followed by a redeploy when required; toggle and wide credential changes don't
      // offer a separate cluster update action.
      if (plan.shouldEditCloudProviderInfo) {
        editedCloudProviderInfo = await editCloudProviderInfoWithoutUpdateAction(variables)
      }

      if (plan.shouldRedeploy) {
        await deployCluster({ organizationId, clusterId })
      }

      methods.reset(getClusterCredentialsFormValuesAfterSave({ formValues, editedCluster, editedCloudProviderInfo }))
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
    if (
      cluster &&
      clusterCloudProviderInfo &&
      !isClusterFetching &&
      !isCloudProviderInfoFetching &&
      initializedFormKeyRef.current !== formInitializationKey
    ) {
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
              slack_webhook_url: cluster?.wide_permissions?.slack_webhook_url ?? '',
            }
          : {
              credentials: clusterCloudProviderInfo.credentials?.id,
              using_restrictive_permissions: false,
            }
      )
      initializedFormKeyRef.current = formInitializationKey
    }
  }, [
    methods,
    cluster,
    clusterCloudProviderInfo,
    clusterId,
    formInitializationKey,
    initialUsingRestrictivePermissions,
    isWideCredentialsEnabled,
    isClusterFetching,
    isCloudProviderInfoFetching,
  ])

  return (
    <FormProvider {...methods}>
      <div className="flex w-full flex-col justify-between">
        <Section className="p-8">
          <SettingsHeading title="Credentials" />
          <div className="max-w-content-with-navigation-left">
            <form onSubmit={onSubmit} className="flex flex-col gap-6">
              {isWideCredentialsEnabled ? (
                <ClusterRestrictivePermissionsSettings cloudProvider={clusterCloudProviderInfo?.cloud_provider} />
              ) : (
                <ClusterCredentialsSettings cloudProvider={clusterCloudProviderInfo?.cloud_provider} isSetting={true} />
              )}
              <div className="flex justify-end">
                <Button
                  data-testid="submit-button"
                  type="submit"
                  size="lg"
                  loading={
                    isClusterFetching ||
                    isCloudProviderInfoFetching ||
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
