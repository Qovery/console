import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { InputText, InputToggle } from '@qovery/shared/ui'
import { ClusterCredentialsSettings } from './cluster-credentials-settings'
import { ClusterWidePermissionCredentialsSettings } from './cluster-wide-permission-credentials-settings'

export interface ClusterRestrictivePermissionsSettingsProps {
  cloudProvider?: CloudProviderEnum
}

export function ClusterRestrictivePermissionsSettings({ cloudProvider }: ClusterRestrictivePermissionsSettingsProps) {
  const { control } = useFormContext()
  // useWatch subscribes this component itself, so it stays in sync even when the parent form is reset
  const isUsingRestrictivePermissions = Boolean(useWatch({ control, name: 'using_restrictive_permissions' }))

  return (
    <div className="flex flex-col gap-6">
      <ClusterWidePermissionCredentialsSettings cloudProvider={cloudProvider} fieldName="configured_credentials" />

      <Controller
        name="using_restrictive_permissions"
        control={control}
        render={({ field }) => (
          <InputToggle
            dataTestId="input-restrictive-permissions-toggle"
            value={Boolean(field.value)}
            onChange={field.onChange}
            title="Use restrictive permissions"
            description="Qovery uses restricted credentials for day-to-day operations and extended credentials only when wider access is required. Action is required in your AWS account when extended credentials need to be used."
            align="top"
            small
          />
        )}
      />

      {isUsingRestrictivePermissions && (
        <div className="flex flex-col gap-4">
          <ClusterCredentialsSettings cloudProvider={cloudProvider} isSetting fieldName="restricted_credentials" />

          <Controller
            name="slack_webhook_url"
            control={control}
            render={({ field }) => (
              <InputText
                dataTestId="input-slack-webhook-url"
                type="password"
                name={field.name}
                onChange={field.onChange}
                value={field.value ?? ''}
                label="Slack webhook URL"
                hint="Receive a Slack message when Qovery requests access to the extended credentials."
                autoComplete="off"
              />
            )}
          />
        </div>
      )}
    </div>
  )
}

export default ClusterRestrictivePermissionsSettings
