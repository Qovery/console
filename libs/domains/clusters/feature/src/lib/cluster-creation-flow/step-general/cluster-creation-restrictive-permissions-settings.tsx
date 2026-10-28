import { useFormContext, useWatch } from 'react-hook-form'
import { ClusterRestrictedCredentialsAndWebhookFields } from '../../cluster-credentials-settings/cluster-restricted-credentials-and-webhook-fields'
import { ClusterRestrictivePermissionsToggle } from '../../cluster-credentials-settings/cluster-restrictive-permissions-toggle'
import { ClusterWidePermissionCredentialsSettings } from '../../cluster-credentials-settings/cluster-wide-permission-credentials-settings'

export function ClusterCreationRestrictivePermissionsSettings() {
  const { control } = useFormContext()
  const isUsingRestrictivePermissions = Boolean(useWatch({ control, name: 'using_restrictive_permissions' }))

  return (
    <div className="flex flex-col gap-3">
      <ClusterRestrictivePermissionsToggle />

      <ClusterWidePermissionCredentialsSettings cloudProvider="AWS" fieldName="credentials" />

      {isUsingRestrictivePermissions && (
        <div className="flex flex-col gap-3">
          <ClusterRestrictedCredentialsAndWebhookFields cloudProvider="AWS" />
        </div>
      )}
    </div>
  )
}

export default ClusterCreationRestrictivePermissionsSettings
