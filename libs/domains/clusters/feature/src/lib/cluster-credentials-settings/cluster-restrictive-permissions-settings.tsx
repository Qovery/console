import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { BlockContent, InputText, InputToggle } from '@qovery/shared/ui'
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
    <>
      <BlockContent title="Configured credentials" dataTestId="configured-credentials-block">
        <ClusterWidePermissionCredentialsSettings
          cloudProvider={cloudProvider}
          fieldName="configured_credentials"
          isSetting
        />
      </BlockContent>

      <Controller
        name="using_restrictive_permissions"
        control={control}
        render={({ field }) => (
          <InputToggle
            dataTestId="input-restrictive-permissions-toggle"
            className="mb-5 mt-5"
            value={Boolean(field.value)}
            onChange={field.onChange}
            title="Use restrictive permissions"
            description="Qovery uses restrictive credentials day-to-day operations and configured credentials only when wider access is required."
            align="top"
            small
          />
        )}
      />

      {isUsingRestrictivePermissions && (
        <>
          <BlockContent title="Restricted credentials" dataTestId="restricted-credentials-block">
            <ClusterCredentialsSettings
              cloudProvider={cloudProvider}
              isSetting
              fieldName="restricted_credentials"
              showSettingsInfo={false}
            />
          </BlockContent>

          {/* UI only for now: the value isn't sent until the backend supports it */}
          <BlockContent title="Slack notification webhook" dataTestId="slack-notification-webhook-block">
            <Controller
              name="slack_webhook_url"
              control={control}
              render={({ field }) => (
                <InputText
                  dataTestId="input-slack-webhook-url"
                  type="password"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Slack webhook URL"
                  placeholder="https://hooks.slack.com/services/…"
                  hint="Receive a Slack message when Qovery requests access to the configured credentials."
                  autoComplete="off"
                />
              )}
            />
          </BlockContent>
        </>
      )}
    </>
  )
}

export default ClusterRestrictivePermissionsSettings
