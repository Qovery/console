import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { useWatch } from 'react-hook-form'
import { ClusterRestrictedCredentialsAndWebhookFields } from './cluster-restricted-credentials-and-webhook-fields'
import { ClusterRestrictivePermissionsToggle } from './cluster-restrictive-permissions-toggle'
import { ClusterWidePermissionCredentialsSettings } from './cluster-wide-permission-credentials-settings'

export interface ClusterRestrictivePermissionsSettingsProps {
  cloudProvider?: CloudProviderEnum
}

export function ClusterRestrictivePermissionsSettings({ cloudProvider }: ClusterRestrictivePermissionsSettingsProps) {
  // useWatch subscribes this component itself, so it stays in sync even when the parent form is reset
  const isUsingRestrictivePermissions = Boolean(useWatch({ name: 'using_restrictive_permissions' }))

  return (
    <div className="flex flex-col gap-6">
      <ClusterWidePermissionCredentialsSettings cloudProvider={cloudProvider} fieldName="configured_credentials" />

      <ClusterRestrictivePermissionsToggle />

      {isUsingRestrictivePermissions && (
        <div className="flex flex-col gap-4">
          <ClusterRestrictedCredentialsAndWebhookFields cloudProvider={cloudProvider} isSetting />
        </div>
      )}
    </div>
  )
}

export default ClusterRestrictivePermissionsSettings
