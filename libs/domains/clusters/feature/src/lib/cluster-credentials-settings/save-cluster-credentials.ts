import {
  type ClusterCloudProviderInfo,
  type ClusterCloudProviderInfoRequest,
  type ClusterCredentials,
} from 'qovery-typescript-axios'

export interface ClusterCredentialsFormValues {
  credentials?: string
  wide_permission_credentials?: string
  using_restrictive_permissions?: boolean
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
  const restrictiveCredentials = credentials.find(({ id }) => id === formValues.credentials)
  if (!restrictiveCredentials) return undefined

  const widePermissionCredentials = formValues.using_restrictive_permissions
    ? credentials.find(({ id }) => id === formValues.wide_permission_credentials)
    : undefined
  if (formValues.using_restrictive_permissions && !widePermissionCredentials) return undefined

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
  const hasCredentialsChanged = formValues.credentials !== cloudProviderInfo.credentials?.id
  const hasWidePermissionCredentialsChanged =
    usingRestrictivePermissions &&
    formValues.wide_permission_credentials !== cloudProviderInfo.wide_permission_credentials?.id
  const shouldEditCluster = usingRestrictivePermissions !== initialUsingRestrictivePermissions

  return {
    shouldEditCluster,
    // Only toggling restrictive permissions is saved on the cluster alone
    shouldEditCloudProviderInfo: hasCredentialsChanged || hasWidePermissionCredentialsChanged || !shouldEditCluster,
    // Only a restrictive credentials change requires a redeploy, not the toggle nor the extended credentials
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
