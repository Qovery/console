import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { InputText } from '@qovery/shared/ui'
import { ClusterCredentialsSettings } from './cluster-credentials-settings'
import { ClusterRestrictivePermissionsToggle } from './cluster-restrictive-permissions-toggle'
import { ClusterWidePermissionCredentialsSettings } from './cluster-wide-permission-credentials-settings'
import { validateSlackWebhookUrl } from './slack-webhook-url'

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

      <ClusterRestrictivePermissionsToggle />

      {isUsingRestrictivePermissions && (
        <div className="flex flex-col gap-4">
          <ClusterCredentialsSettings cloudProvider={cloudProvider} isSetting fieldName="restricted_credentials" />

          <Controller
            name="slack_webhook_url"
            control={control}
            rules={{ validate: validateSlackWebhookUrl }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                dataTestId="input-slack-webhook-url"
                type="password"
                name={field.name}
                onChange={field.onChange}
                value={field.value ?? ''}
                label="Slack webhook URL"
                hint="Receive a Slack message when Qovery requests access to the extended credentials."
                error={error?.message}
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
