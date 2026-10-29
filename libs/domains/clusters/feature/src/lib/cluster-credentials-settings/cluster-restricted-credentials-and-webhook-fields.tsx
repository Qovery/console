import { Controller, useFormContext } from 'react-hook-form'
import { InputText } from '@qovery/shared/ui'
import { ClusterCredentialsSettings, type ClusterCredentialsSettingsProps } from './cluster-credentials-settings'
import { validateSlackWebhookUrl } from './slack-webhook-url'

export interface ClusterRestrictedCredentialsAndWebhookFieldsProps {
  cloudProvider?: ClusterCredentialsSettingsProps['cloudProvider']
  isSetting?: boolean
}

export function ClusterRestrictedCredentialsAndWebhookFields({
  cloudProvider,
  isSetting,
}: ClusterRestrictedCredentialsAndWebhookFieldsProps) {
  const { control } = useFormContext()

  return (
    <>
      <ClusterCredentialsSettings
        cloudProvider={cloudProvider}
        isSetting={isSetting}
        fieldName="restricted_credentials"
      />

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
    </>
  )
}

export default ClusterRestrictedCredentialsAndWebhookFields
