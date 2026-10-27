import {
  type Cluster,
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

export const getClusterCredentialsFormValuesAfterSave = ({
  formValues,
  editedCluster,
  editedCloudProviderInfo,
}: {
  formValues: ClusterCredentialsFormValues
  editedCluster?: Cluster
  editedCloudProviderInfo?: ClusterCloudProviderInfo
}): ClusterCredentialsFormValues => {
  const usingRestrictivePermissions =
    editedCluster?.wide_permissions?.using_restrictive_permissions ?? Boolean(formValues.using_restrictive_permissions)
  const responseSlackWebhookUrl = editedCluster?.wide_permissions?.slack_webhook_url

  return {
    configured_credentials: editedCloudProviderInfo
      ? (usingRestrictivePermissions
          ? editedCloudProviderInfo.wide_permission_credentials?.id
          : editedCloudProviderInfo.credentials?.id) ?? formValues.configured_credentials
      : formValues.configured_credentials,
    restricted_credentials: usingRestrictivePermissions
      ? editedCloudProviderInfo?.credentials?.id ?? formValues.restricted_credentials
      : undefined,
    using_restrictive_permissions: usingRestrictivePermissions,
    slack_webhook_url: usingRestrictivePermissions
      ? editedCluster && responseSlackWebhookUrl !== undefined
        ? responseSlackWebhookUrl ?? ''
        : formValues.slack_webhook_url ?? ''
      : '',
  }
}

export const getNormalizedSlackWebhookUrl = (url?: string | null) => url?.trim() || null

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
