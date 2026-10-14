import {
  type ClusterCloudProviderInfo,
  type ClusterCloudProviderInfoRequest,
  type ClusterCredentials,
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

export const getClusterCredentialsSavePlan = ({
  formValues,
  cloudProviderInfo,
  initialUsingRestrictivePermissions,
}: {
  formValues: ClusterCredentialsFormValues
  cloudProviderInfo: ClusterCloudProviderInfo
  initialUsingRestrictivePermissions: boolean
}): ClusterCredentialsSavePlan => {
  const usingRestrictivePermissions = Boolean(formValues.using_restrictive_permissions)
  const credentialsId = usingRestrictivePermissions
    ? formValues.restricted_credentials ?? formValues.credentials
    : formValues.configured_credentials ?? formValues.credentials
  const hasCredentialsChanged = credentialsId !== cloudProviderInfo.credentials?.id
  const hasWidePermissionCredentialsChanged =
    usingRestrictivePermissions &&
    (formValues.configured_credentials ?? formValues.wide_permission_credentials) !==
      cloudProviderInfo.wide_permission_credentials?.id
  const shouldEditCluster = usingRestrictivePermissions !== initialUsingRestrictivePermissions

  return {
    shouldEditCluster,
    // Toggling restrictive permissions is saved on the cluster; changed credential mappings are saved with cloud provider info.
    shouldEditCloudProviderInfo: hasCredentialsChanged || hasWidePermissionCredentialsChanged || !shouldEditCluster,
    // Changing the API credentials field requires a redeploy; changing the configured wide credential alone does not.
    shouldRedeploy: hasCredentialsChanged,
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
