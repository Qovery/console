import { type CloudProviderEnum, type Cluster } from 'qovery-typescript-axios'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { BlockContent, InputText, InputToggle } from '@qovery/shared/ui'
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
        <>
          <BlockContent title="Extended credentials" dataTestId="extended-credentials-block">
            <ClusterWidePermissionCredentialsSettings cloudProvider={cloudProvider} />
          </BlockContent>

          {/* UI only for now: the value isn't sent until the backend supports it */}
          <BlockContent title="Slack webhook" dataTestId="slack-webhook-block">
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
                  hint="Receive a Slack message when Qovery requests access to the extended credentials."
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
