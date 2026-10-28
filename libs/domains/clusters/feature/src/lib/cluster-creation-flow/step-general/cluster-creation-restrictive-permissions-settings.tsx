import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { InputText, InputToggle } from '@qovery/shared/ui'
import { ClusterCredentialsSettings } from '../../cluster-credentials-settings/cluster-credentials-settings'

const SLACK_WEBHOOK_URL_PATTERN = new RegExp(
  String.raw`^https://hooks\.slack\.com(?::\d+)?(?:/(?:[A-Za-z0-9._~-]|%[A-Fa-f0-9]{2}|[!$&'()*+,;=:@/])*)?(?:\?(?:[A-Za-z0-9._~-]|%[A-Fa-f0-9]{2}|[!$&'()*+,;=:@/?])*)?(?:#(?:[A-Za-z0-9._~-]|%[A-Fa-f0-9]{2}|[!$&'()*+,;=:@/?])*)?$`,
  'i'
)
const SLACK_WEBHOOK_URL_ERROR = 'Enter a valid Slack webhook URL from hooks.slack.com.'

export function ClusterCreationRestrictivePermissionsSettings() {
  const { control } = useFormContext()
  const isUsingRestrictivePermissions = Boolean(useWatch({ control, name: 'using_restrictive_permissions' }))

  return (
    <div className="flex flex-col gap-3">
      <Controller
        name="using_restrictive_permissions"
        control={control}
        defaultValue={false}
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

      <ClusterCredentialsSettings cloudProvider="AWS" label="Extended credentials" />

      {isUsingRestrictivePermissions && (
        <div className="flex flex-col gap-3">
          <ClusterCredentialsSettings cloudProvider="AWS" fieldName="restricted_credentials" isSetting />

          <Controller
            name="slack_webhook_url"
            control={control}
            rules={{
              validate: (value) => {
                const url = typeof value === 'string' ? value.trim() : ''
                return !url || SLACK_WEBHOOK_URL_PATTERN.test(url) || SLACK_WEBHOOK_URL_ERROR
              },
            }}
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
