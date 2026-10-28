import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { InputText } from '@qovery/shared/ui'
import { ClusterCredentialsSettings } from '../../cluster-credentials-settings/cluster-credentials-settings'
import { ClusterRestrictivePermissionsToggle } from '../../cluster-credentials-settings/cluster-restrictive-permissions-toggle'
import { ClusterWidePermissionCredentialsSettings } from '../../cluster-credentials-settings/cluster-wide-permission-credentials-settings'
import { validateSlackWebhookUrl } from '../../cluster-credentials-settings/slack-webhook-url'

export function ClusterCreationRestrictivePermissionsSettings() {
  const { control } = useFormContext()
  const isUsingRestrictivePermissions = Boolean(useWatch({ control, name: 'using_restrictive_permissions' }))

  return (
    <div className="flex flex-col gap-3">
      <ClusterRestrictivePermissionsToggle defaultValue={false} />

      <ClusterWidePermissionCredentialsSettings cloudProvider="AWS" fieldName="credentials" />

      {isUsingRestrictivePermissions && (
        <div className="flex flex-col gap-3">
          <ClusterCredentialsSettings cloudProvider="AWS" fieldName="restricted_credentials" />

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

export default ClusterCreationRestrictivePermissionsSettings
