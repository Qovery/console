import {
  type AlertReceiverCreationRequest,
  type AlertReceiverEditRequest,
  type AlertReceiverResponse,
  type AlertReceiverType,
  type SlackAlertReceiverCreationRequest,
  type SlackAlertReceiverEditRequest,
} from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Button, ExternalLink, InputSelect, InputText, ModalCrud } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
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

  const methods = useForm<SlackAlertReceiverCreationRequest>({
    mode: 'onChange',
    defaultValues: {
      name: alertReceiver?.name ?? 'Input slack channel',
      type: alertReceiver?.type ?? 'SLACK',
      send_resolved: alertReceiver?.send_resolved ?? true,
      webhook_url: isEdit ? FAKE_PLACEHOLDER : undefined,
    },
    resolver: (values) => {
      const errors: Record<string, { type: string; message: string }> = {}
      if (!values.name || values.name.trim() === '') {
        errors['name'] = {
          type: 'required',
          message: 'Please enter a display name.',
        }
      }
      if (!isEdit && (!values.webhook_url || values.webhook_url.trim() === '')) {
        errors['webhook_url'] = {
          type: 'required',
          message: 'Please enter a webhook URL.',
        }
      }
      return {
        values,
        errors,
      }
    },
  })

  const handleSubmit = methods.handleSubmit(async (data) => {
    if (isEdit && alertReceiver) {
      const { webhook_url, ...restData } = data
      const webhookUrlValue = webhook_url === FAKE_PLACEHOLDER ? undefined : webhook_url
      const editPayload: SlackAlertReceiverEditRequest = {
        ...restData,
        type: 'SLACK',
        description: alertReceiver.description ?? 'Webhook for Qovery alerts',
        ...(webhookUrlValue && webhookUrlValue.trim() !== '' ? { webhook_url: webhookUrlValue } : {}),
      }

      try {
        await editAlertReceiver({ alertReceiverId: alertReceiver.id, payload: editPayload as AlertReceiverEditRequest })
        onClose()
      } catch (error) {
        console.error(error)
      }
    } else {
      const createRequest: SlackAlertReceiverCreationRequest = {
        ...data,
        type: 'SLACK',
        description: 'Webhook for Qovery alerts',
        organization_id: organizationId,
      }

      try {
        await createAlertReceiver({ payload: createRequest as AlertReceiverCreationRequest })
        onClose()
      } catch (error) {
        console.error(error)
      }
    }
  })

  const handleSendTest = async () => {
    const isEdit = Boolean(alertReceiver)
    const webhookUrl = methods.getValues('webhook_url')

    if (isEdit && alertReceiver?.id) {
      validateAlertReceiver({
        alertReceiverId: alertReceiver.id,
        payload: {},
      })
    } else {
      const formData = methods.getValues()
      const alertReceiverPayload: SlackAlertReceiverCreationRequest = {
        ...formData,
        type: 'SLACK',
        organization_id: organizationId,
        description: 'Webhook for Qovery alerts',
        webhook_url: webhookUrl ?? '',
      }
      validateAlertReceiver({
        payload: {
          alert_receiver: alertReceiverPayload as AlertReceiverCreationRequest,
        },
      })
    }
  }

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={isEdit ? 'Edit channel' : 'New channel'}
        description={
          isEdit ? undefined : (
            <>
              Select the {upperCaseFirstLetter(type)} channel you want to add as a selectable notification channel for
              your alerts.{' '}
              <ExternalLink href="https://www.qovery.com/docs/configuration/integrations/slack" size="sm">
                How to configure it
              </ExternalLink>
            </>
          )
        }
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
                  options={CHANNEL_TYPE_OPTIONS.map((option) => ({
                    ...option,
                    isDisabled: option.value !== 'SLACK',
                  }))}
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
          <Controller
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
        </div>
      </ModalCrud>
    </FormProvider>
  )
}

export default NotificationChannelModal
