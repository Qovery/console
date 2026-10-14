import { type CloudProviderEnum, type Cluster } from 'qovery-typescript-axios'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { BlockContent, InputToggle } from '@qovery/shared/ui'
import { ClusterCredentialsSettings } from './cluster-credentials-settings'
import { ClusterWidePermissionCredentialsSettings } from './cluster-wide-permission-credentials-settings'

export interface ClusterRestrictivePermissionsSettingsProps {
  cloudProvider?: CloudProviderEnum
  cluster?: Cluster
}

export function ClusterRestrictivePermissionsSettings({
  cloudProvider,
  cluster,
}: ClusterRestrictivePermissionsSettingsProps) {
  const { control } = useFormContext()
  // useWatch subscribes this component itself, so it stays in sync even when the parent form is reset
  const isUsingRestrictivePermissions = Boolean(useWatch({ control, name: 'using_restrictive_permissions' }))

  return (
    <>
      <Controller
        name="using_restrictive_permissions"
        control={control}
        render={({ field }) => (
          <InputToggle
            dataTestId="input-restrictive-permissions-toggle"
            className="mb-5"
            value={Boolean(field.value)}
            onChange={field.onChange}
            title="Use restrictive permissions"
            description="Qovery uses restrictive credentials for day-to-day operations and extended credentials (AWS role) only when wider access is required."
            align="top"
            small
          />
        )}
      />

      <BlockContent
        title={isUsingRestrictivePermissions ? 'Restrictive credentials' : 'Configured credentials'}
        dataTestId="restrictive-credentials-block"
      >
        <ClusterCredentialsSettings
          cloudProvider={cloudProvider}
          isSetting
          cluster={cluster}
          isUsingRestrictivePermissions={isUsingRestrictivePermissions}
        />
      </BlockContent>

      {isUsingRestrictivePermissions && (
        <BlockContent title="Extended credentials" dataTestId="extended-credentials-block">
          <ClusterWidePermissionCredentialsSettings cloudProvider={cloudProvider} />
        </BlockContent>
      )}
    </>
  )
}

export default ClusterRestrictivePermissionsSettings
