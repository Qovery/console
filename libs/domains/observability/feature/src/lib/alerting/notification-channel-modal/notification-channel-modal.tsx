import { type AlertReceiverResponse, type SlackAlertReceiverCreationRequest } from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { InputSelect, InputText, ModalCrud } from '@qovery/shared/ui'
import { useCreateAlertReceiver } from '../../hooks/use-create-alert-receiver/use-create-alert-receiver'
import { useEditAlertReceiver } from '../../hooks/use-edit-alert-receiver/use-edit-alert-receiver'

interface NotificationChannelModalProps {
  onClose: () => void
  organizationId: string
  alertReceiver?: AlertReceiverResponse
}

const CHANNEL_TYPE_OPTIONS = [
  { value: 'SLACK', label: 'Slack' },
  { value: 'WEBHOOK', label: 'Webhook' },
  { value: 'EMAIL', label: 'Email' },
]

export function NotificationChannelModal({ onClose, organizationId, alertReceiver }: NotificationChannelModalProps) {
  const isEdit = Boolean(alertReceiver)
  const { mutateAsync: editAlertReceiver, isLoading: isLoadingEditAlertReceiver } = useEditAlertReceiver({
    organizationId,
  })
  const { mutateAsync: createAlertReceiver, isLoading: isLoadingCreateAlertReceiver } = useCreateAlertReceiver({
    organizationId,
  })

  const methods = useForm<SlackAlertReceiverCreationRequest>({
    mode: 'onChange',
    defaultValues: {
      name: alertReceiver?.name ?? 'Input slack channel',
      type: alertReceiver?.type ?? 'SLACK',
      send_resolved: alertReceiver?.send_resolved ?? true,
    },
    resolver: (values) => {
      const errors: Record<string, { type: string; message: string }> = {}
      if (!values.name || values.name.trim() === '') {
        errors['name'] = {
          type: 'required',
          message: 'Please enter a display name.',
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
      try {
        await editAlertReceiver({ alertReceiverId: alertReceiver.id, payload: data })
        onClose()
      } catch (error) {
        console.error(error)
      }
    } else {
      const createRequest: SlackAlertReceiverCreationRequest = {
        ...data,
        description: 'Webhook for Qovery alerts',
        organization_id: organizationId,
      }

      try {
        await createAlertReceiver({ payload: createRequest })
        onClose()
      } catch (error) {
        console.error(error)
      }
    }
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={isEdit ? 'Edit channel' : 'New channel'}
        description={
          isEdit ? undefined : 'Select the channel you want to add as a selectable notification channel for your alerts'
        }
        onClose={onClose}
        onSubmit={handleSubmit}
        loading={isLoadingEditAlertReceiver || isLoadingCreateAlertReceiver}
        isEdit={isEdit}
        submitLabel={isEdit ? 'Save' : 'Confirm creation'}
      >
        <div className="flex flex-col gap-5">
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
              required: 'Please enter a webhook URL.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                className="mb-1"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
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
