import posthog from 'posthog-js'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { InputTextArea, ModalCrud, toast } from '@qovery/shared/ui'

export interface SecretManagerMissingModalProps {
  organizationId: string
  clusterId?: string
  source: 'creation-flow' | 'settings'
  onClose: () => void
}

type SecretManagerMissingFormValues = {
  message: string
}

export function SecretManagerMissingModal({
  organizationId,
  clusterId,
  source,
  onClose,
}: SecretManagerMissingModalProps) {
  const methods = useForm<SecretManagerMissingFormValues>({
    defaultValues: { message: '' },
    mode: 'onChange',
  })

  const handleSubmit = methods.handleSubmit((data) => {
    posthog.capture('cluster-secret-manager-missing-feedback', {
      message: data.message.trim(),
      organization_id: organizationId,
      cluster_id: clusterId,
      source,
    })
    toast('success', 'Thanks for the feedback!', "We'll let you know when it's available.")
    onClose()
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Request a secret manager integration"
        description="Tell us which secret manager you'd like Qovery to support next."
        onSubmit={handleSubmit}
        onClose={onClose}
        submitLabel="Send request"
      >
        <Controller
          name="message"
          control={methods.control}
          rules={{ required: 'Please describe the secret manager you need.' }}
          render={({ field, fieldState: { error } }) => (
            <InputTextArea
              className="w-full"
              label="Which secret manager is missing?"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              error={error?.message}
              hint="e.g. HashiCorp Vault, Azure Key Vault, Doppler..."
            />
          )}
        />
      </ModalCrud>
    </FormProvider>
  )
}

export default SecretManagerMissingModal
