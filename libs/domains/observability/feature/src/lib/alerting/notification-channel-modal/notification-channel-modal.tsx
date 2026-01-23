import {
  type AlertReceiverCreationRequest,
  type AlertReceiverEditRequest,
  type AlertReceiverResponse,
  type AlertReceiverType,
  type EmailAlertReceiverCreationRequest,
  type EmailAlertReceiverEditRequest,
  type EmailAlertReceiverResponse,
  type SlackAlertReceiverCreationRequest,
  type SlackAlertReceiverEditRequest,
} from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import { Button, ExternalLink, InputSelect, InputText, InputToggle, ModalCrud } from '@qovery/shared/ui'
import { useCreateAlertReceiver } from '../../hooks/use-create-alert-receiver/use-create-alert-receiver'
import { useEditAlertReceiver } from '../../hooks/use-edit-alert-receiver/use-edit-alert-receiver'
import { useValidateAlertReceiver } from '../../hooks/use-validate-alert-receiver/use-validate-alert-receiver'

interface NotificationChannelModalProps {
  onClose: () => void
  organizationId: string
  alertReceiver?: AlertReceiverResponse
  type?: AlertReceiverType
}

const CHANNEL_TYPE_OPTIONS = [
  { value: 'SLACK', label: 'Slack' },
  { value: 'WEBHOOK', label: 'Webhook' },
  { value: 'EMAIL', label: 'Email' },
]

const FAKE_PLACEHOLDER = 'fakewebhookurl'

type SlackFormData = {
  type: 'SLACK'
  name: string
  webhook_url?: string
  send_resolved: boolean
}

type EmailFormData = {
  type: 'EMAIL'
  name: string
  to: string
  from: string
  smarthost: string
  auth_username?: string
  auth_password?: string
  require_tls: boolean
  send_resolved: boolean
}

type AlertReceiverFormData = SlackFormData | EmailFormData

const validateSlackForm = (values: SlackFormData, isEdit: boolean) => {
  const errors: Record<string, { type: string; message: string }> = {}

  if (!values.name || values.name.trim() === '') {
    errors['name'] = { type: 'required', message: 'Please enter a display name.' }
  }

  if (!isEdit && (!values.webhook_url || values.webhook_url.trim() === '')) {
    errors['webhook_url'] = { type: 'required', message: 'Please enter a webhook URL.' }
  }

  return { values, errors }
}

const validateEmailForm = (values: EmailFormData, isEdit: boolean) => {
  const errors: Record<string, { type: string; message: string }> = {}

  if (!values.name || values.name.trim() === '') {
    errors['name'] = { type: 'required', message: 'Please enter a display name.' }
  }

  // Validation multi-emails
  if (!values.to || values.to.trim() === '') {
    errors['to'] = { type: 'required', message: 'Please enter at least one email address.' }
  } else {
    const emails = values.to.split(',').map((e) => e.trim())
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const allValid = emails.every((email) => emailRegex.test(email))
    if (!allValid) {
      errors['to'] = { type: 'pattern', message: 'Please enter valid email addresses' }
    }
  }

  // Validation from
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!values.from || !emailRegex.test(values.from)) {
    errors['from'] = { type: 'pattern', message: 'Please enter a valid sender email' }
  }

  // Validation smarthost
  const smarthostRegex = /^[^:]+:\d+$/
  if (!values.smarthost || !smarthostRegex.test(values.smarthost)) {
    errors['smarthost'] = {
      type: 'pattern',
      message: 'Format must be host:port (e.g., smtp.gmail.com:587)',
    }
  }

  // Validation password
  if (!isEdit && (!values.auth_password || values.auth_password.trim() === '')) {
    errors['auth_password'] = { type: 'required', message: 'Please enter SMTP password.' }
  }

  return { values, errors }
}

const buildCreationPayload = (
  type: AlertReceiverType,
  formData: AlertReceiverFormData,
  organizationId: string
): AlertReceiverCreationRequest => {
  return match(type)
    .with('SLACK', (): AlertReceiverCreationRequest => {
      const data = formData as SlackFormData
      const slackPayload: SlackAlertReceiverCreationRequest = {
        type: 'SLACK',
        name: data.name,
        description: 'Webhook for Qovery alerts',
        organization_id: organizationId,
        send_resolved: data.send_resolved,
        webhook_url: data.webhook_url ?? '',
      }
      return slackPayload as AlertReceiverCreationRequest
    })
    .with('EMAIL', (): AlertReceiverCreationRequest => {
      const data = formData as EmailFormData
      const emailPayload: EmailAlertReceiverCreationRequest = {
        type: 'EMAIL',
        name: data.name,
        description: 'Email notifications for Qovery alerts',
        organization_id: organizationId,
        send_resolved: data.send_resolved,
        to: data.to,
        from: data.from,
        smarthost: data.smarthost,
        auth_username: data.auth_username || null,
        auth_password: data.auth_password ?? '',
        require_tls: data.require_tls,
      }
      return emailPayload as AlertReceiverCreationRequest
    })
    .exhaustive()
}

const buildEditPayload = (
  type: AlertReceiverType,
  formData: AlertReceiverFormData,
  existingDescription: string,
  secretValue?: string
): AlertReceiverEditRequest => {
  return match(type)
    .with('SLACK', (): AlertReceiverEditRequest => {
      const data = formData as SlackFormData
      const slackPayload: SlackAlertReceiverEditRequest = {
        type: 'SLACK',
        name: data.name,
        description: existingDescription,
        send_resolved: data.send_resolved,
        ...(secretValue && secretValue.trim() !== '' ? { webhook_url: secretValue } : {}),
      }
      return slackPayload as AlertReceiverEditRequest
    })
    .with('EMAIL', (): AlertReceiverEditRequest => {
      const data = formData as EmailFormData
      const emailPayload: EmailAlertReceiverEditRequest = {
        type: 'EMAIL',
        name: data.name,
        description: existingDescription,
        send_resolved: data.send_resolved,
        to: data.to,
        from: data.from,
        smarthost: data.smarthost,
        auth_username: data.auth_username || null,
        require_tls: data.require_tls,
        ...(secretValue && secretValue !== FAKE_PLACEHOLDER ? { auth_password: secretValue } : {}),
      }
      return emailPayload as AlertReceiverEditRequest
    })
    .exhaustive()
}

export function NotificationChannelModal({
  type,
  onClose,
  organizationId,
  alertReceiver,
}: NotificationChannelModalProps) {
  const isEdit = Boolean(alertReceiver)
  const { mutateAsync: editAlertReceiver, isLoading: isLoadingEditAlertReceiver } = useEditAlertReceiver({
    organizationId,
  })
  const { mutateAsync: createAlertReceiver, isLoading: isLoadingCreateAlertReceiver } = useCreateAlertReceiver({
    organizationId,
  })
  const { mutate: validateAlertReceiver, isLoading: isLoadingValidateAlertReceiver } = useValidateAlertReceiver()

  const receiverType = alertReceiver?.type ?? type ?? 'SLACK'

  const defaultValues = match(receiverType)
    .with('SLACK', () => ({
      type: 'SLACK' as const,
      name: alertReceiver?.name ?? 'Input slack channel',
      send_resolved: alertReceiver?.send_resolved ?? true,
      webhook_url: isEdit ? FAKE_PLACEHOLDER : undefined,
    }))
    .with('EMAIL', () => {
      const emailReceiver = alertReceiver as EmailAlertReceiverResponse | undefined
      return {
        type: 'EMAIL' as const,
        name: emailReceiver?.name ?? 'Email notifications',
        send_resolved: emailReceiver?.send_resolved ?? true,
        to: emailReceiver?.to ?? '',
        from: emailReceiver?.from ?? '',
        smarthost: emailReceiver?.smarthost ?? '',
        auth_username: emailReceiver?.auth_username ?? '',
        auth_password: isEdit ? FAKE_PLACEHOLDER : '',
        require_tls: emailReceiver?.require_tls ?? true,
      }
    })
    .exhaustive()

  const methods = useForm<AlertReceiverFormData>({
    mode: 'onChange',
    defaultValues,
    resolver: (values) => {
      return match(values.type)
        .with('SLACK', () => validateSlackForm(values as SlackFormData, isEdit))
        .with('EMAIL', () => validateEmailForm(values as EmailFormData, isEdit))
        .exhaustive()
    },
  })

  const handleSubmit = methods.handleSubmit(async (data) => {
    try {
      if (isEdit && alertReceiver) {
        const secretValue = match(receiverType)
          .with('SLACK', () => {
            const slackData = data as SlackFormData
            return slackData.webhook_url === FAKE_PLACEHOLDER ? undefined : slackData.webhook_url
          })
          .with('EMAIL', () => {
            const emailData = data as EmailFormData
            return emailData.auth_password === FAKE_PLACEHOLDER ? undefined : emailData.auth_password
          })
          .exhaustive()

        const payload = buildEditPayload(
          receiverType,
          data,
          alertReceiver.description ?? 'Notifications for Qovery alerts',
          secretValue
        )

        await editAlertReceiver({ alertReceiverId: alertReceiver.id, payload })
      } else {
        const payload = buildCreationPayload(receiverType, data, organizationId)
        await createAlertReceiver({ payload })
      }

      onClose()
    } catch (error) {
      console.error(error)
    }
  })

  const handleSendTest = () => {
    if (isEdit && alertReceiver?.id) {
      validateAlertReceiver({
        alertReceiverId: alertReceiver.id,
        payload: {},
      })
    } else {
      const formData = methods.getValues()
      const payload = buildCreationPayload(receiverType, formData, organizationId)
      validateAlertReceiver({
        payload: {
          alert_receiver: payload,
        },
      })
    }
  }

  const modalContent = match(receiverType)
    .with('SLACK', () => ({
      title: isEdit ? 'Edit channel' : 'New channel',
      description: isEdit ? undefined : (
        <>
          Select the Slack channel you want to add as a selectable notification channel for your alerts.{' '}
          <ExternalLink href="https://www.qovery.com/docs/configuration/integrations/slack" size="sm">
            How to configure it
          </ExternalLink>
        </>
      ),
    }))
    .with('EMAIL', () => ({
      title: isEdit ? 'Edit email' : 'New email',
      description: isEdit
        ? undefined
        : 'Enter the email address you want to add as a selectable notification channel for your alerts',
    }))
    .exhaustive()

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={modalContent.title}
        description={modalContent.description}
        onClose={onClose}
        onSubmit={handleSubmit}
        loading={isLoadingEditAlertReceiver || isLoadingCreateAlertReceiver}
        isEdit={isEdit}
        submitLabel={isEdit ? 'Save' : 'Confirm creation'}
        bottomButtons={
          <Button
            type="button"
            onClick={handleSendTest}
            loading={isLoadingValidateAlertReceiver}
            className="mr-auto"
            variant="outline"
            color="neutral"
            size="lg"
          >
            Send test notification
          </Button>
        }
      >
        <div className="flex flex-col gap-5">
          {!type && (
            <Controller
              name="type"
              control={methods.control}
              render={({ field, fieldState: { error } }) => (
                <InputSelect
                  label="Channel type"
                  value={field.value}
                  options={CHANNEL_TYPE_OPTIONS}
                  onChange={field.onChange}
                  error={error?.message}
                  disabled
                />
              )}
            />
          )}
          <Controller
            name="name"
            control={methods.control}
            rules={{
              required: 'Please enter a display name.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                className="mb-1"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Display name"
                error={error?.message}
                hint="How it will be displayed on your Qovery interface"
              />
            )}
          />
          {match(receiverType)
            .with('SLACK', () => (
              <Controller
                key="webhook_url"
                name="webhook_url"
                control={methods.control}
                rules={{
                  required: !isEdit ? 'Please enter a webhook URL.' : false,
                }}
                render={({ field, fieldState: { error } }) => (
                  <InputText
                    className="mb-1 [&_.absolute]:hidden"
                    name={field.name}
                    onChange={field.onChange}
                    value={field.value ?? ''}
                    type={isEdit ? 'password' : 'text'}
                    label="Webhook URL"
                    error={error?.message}
                  />
                )}
              />
            ))
            .with('EMAIL', () => (
              <>
                <Controller
                  key="to"
                  name="to"
                  control={methods.control}
                  rules={{ required: 'Please enter at least one email address.' }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      className="mb-1"
                      name={field.name}
                      label="To email"
                      value={field.value}
                      onChange={field.onChange}
                      error={error?.message}
                      placeholder="user@example.com"
                    />
                  )}
                />

                <Controller
                  key="from"
                  name="from"
                  control={methods.control}
                  rules={{ required: 'Please enter sender email address.' }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      className="mb-1"
                      name={field.name}
                      label="From email"
                      hint="Email address that will appear as sender"
                      value={field.value}
                      onChange={field.onChange}
                      error={error?.message}
                      placeholder="alerts@yourcompany.com"
                    />
                  )}
                />

                <Controller
                  key="smarthost"
                  name="smarthost"
                  control={methods.control}
                  rules={{ required: 'Please enter SMTP server.' }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      className="mb-1"
                      name={field.name}
                      label="SMTP Server"
                      hint="Format: host:port"
                      value={field.value}
                      onChange={field.onChange}
                      error={error?.message}
                      placeholder="smtp.gmail.com:587"
                    />
                  )}
                />

                <Controller
                  key="auth_username"
                  name="auth_username"
                  control={methods.control}
                  render={({ field }) => (
                    <InputText
                      className="mb-1"
                      name={field.name}
                      label="SMTP Username"
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      placeholder="username@example.com"
                    />
                  )}
                />

                <Controller
                  key="auth_password"
                  name="auth_password"
                  control={methods.control}
                  rules={{ required: !isEdit ? 'Please enter SMTP password.' : false }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      className="mb-1"
                      name={field.name}
                      type="password"
                      label="SMTP Password"
                      hint={isEdit ? 'Leave empty to keep existing password' : undefined}
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      error={error?.message}
                    />
                  )}
                />

                <Controller
                  key="require_tls"
                  name="require_tls"
                  control={methods.control}
                  render={({ field }) => (
                    <InputToggle
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      title="Require TLS"
                      description="Force TLS encryption for SMTP connection"
                    />
                  )}
                />
              </>
            ))
            .exhaustive()}
        </div>
      </ModalCrud>
    </FormProvider>
  )
}

export default NotificationChannelModal
