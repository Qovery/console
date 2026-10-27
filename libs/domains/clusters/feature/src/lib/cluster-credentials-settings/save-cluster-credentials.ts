import {
  type ClusterCloudProviderInfo,
  type ClusterCloudProviderInfoRequest,
  type ClusterCredentials,
  type WidePermissionsRequestDto,
  type WidePermissionsResponseDto,
} from 'qovery-typescript-axios'

export interface ClusterCredentialsFormValues {
  configured_credentials?: string
  restricted_credentials?: string
  credentials?: string
  wide_permission_credentials?: string
  using_restrictive_permissions?: boolean
  slack_webhook_url?: string
}

export interface ClusterCredentialsSavePlan {
  shouldEditCluster: boolean
  shouldEditCloudProviderInfo: boolean
  shouldRedeploy: boolean
}

const getNormalizedSlackWebhookUrl = (url?: string | null) => url?.trim() || null

export const getWidePermissionsRequest = (
  formValues: ClusterCredentialsFormValues,
  currentWidePermissions?: WidePermissionsResponseDto
): WidePermissionsRequestDto => {
  const usingRestrictivePermissions = Boolean(formValues.using_restrictive_permissions)

  if (!usingRestrictivePermissions) {
    return {
      using_restrictive_permissions: false,
      wide_scope_cloud_account_id: null,
      slack_webhook_url: null,
    }
  }

  return {
    using_restrictive_permissions: true,
    wide_scope_cloud_account_id: currentWidePermissions?.wide_scope_cloud_account_id ?? null,
    slack_webhook_url: getNormalizedSlackWebhookUrl(formValues.slack_webhook_url),
  }
}

export const getCloudProviderInfoRequest = (
  formValues: ClusterCredentialsFormValues,
  credentials: ClusterCredentials[],
  cloudProviderInfo: ClusterCloudProviderInfo
): ClusterCloudProviderInfoRequest | undefined => {
  const usingRestrictivePermissions = Boolean(formValues.using_restrictive_permissions)
  const credentialsId = usingRestrictivePermissions
    ? formValues.restricted_credentials ?? formValues.credentials
    : formValues.configured_credentials ?? formValues.credentials
  const restrictiveCredentials = credentials.find(({ id }) => id === credentialsId)
  if (!restrictiveCredentials) return undefined

  const widePermissionCredentials = usingRestrictivePermissions
    ? credentials.find(({ id }) => id === (formValues.configured_credentials ?? formValues.wide_permission_credentials))
    : undefined
  if (usingRestrictivePermissions && !widePermissionCredentials) return undefined

  return {
    cloud_provider: cloudProviderInfo.cloud_provider,
    credentials: {
      id: restrictiveCredentials.id,
      name: restrictiveCredentials.name,
    },
    region: cloudProviderInfo.region,
    // When restrictive permissions are turned off, the backend clears the extended credentials itself
    ...(widePermissionCredentials && {
      wide_permission_credentials: {
        id: widePermissionCredentials.id,
        name: widePermissionCredentials.name,
      },
    }),
  }
}

// The cluster is updated first, the credentials are only sent once it succeeded, then the cluster is redeployed
export async function saveClusterCredentials({
  plan,
  editCluster,
  editCloudProviderInfo,
  deployCluster,
}: {
  plan: ClusterCredentialsSavePlan
  editCluster: () => Promise<unknown>
  editCloudProviderInfo: () => Promise<unknown>
  deployCluster: () => Promise<unknown>
}) {
  if (plan.shouldEditCluster) await editCluster()
  if (plan.shouldEditCloudProviderInfo) await editCloudProviderInfo()
  if (plan.shouldRedeploy) await deployCluster()
}
