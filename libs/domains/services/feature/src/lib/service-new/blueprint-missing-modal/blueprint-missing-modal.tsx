import posthog from 'posthog-js'
import { useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { InputTextArea, ModalCrud, toast } from '@qovery/shared/ui'

export interface BlueprintMissingModalProps {
  organizationId: string
  cloudProvider?: string
  searchInput?: string
  onClose: () => void
}

type BlueprintMissingFormValues = {
  message: string
}

export function BlueprintMissingModal({
  organizationId,
  cloudProvider,
  searchInput,
  onClose,
}: BlueprintMissingModalProps) {
  const methods = useForm<BlueprintMissingFormValues>({
    defaultValues: { message: searchInput ?? '' },
    mode: 'onChange',
  })

  useEffect(() => {
    methods.trigger()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = methods.handleSubmit((data) => {
    posthog.capture('blueprint-missing-feedback', {
      message: data.message.trim(),
      organization_id: organizationId,
      cloud_provider: cloudProvider,
    })
    toast('success', 'Thanks for the feedback!', "We'll let you know when it's available.")
    onClose()
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Request a blueprint"
        description="Tell us which service, database, or infrastructure blueprint you'd like Qovery to add next."
        onSubmit={handleSubmit}
        onClose={onClose}
        submitLabel="Send request"
      >
        <Controller
          name="message"
          control={methods.control}
          rules={{ validate: (v: string) => v.trim().length > 0 || 'Please describe the blueprint you need.' }}
          render={({ field, fieldState: { error } }) => (
            <InputTextArea
              className="w-full"
              label="Which blueprint is missing?"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              error={error?.message}
              hint="e.g. MongoDB Atlas, Kafka, Elasticsearch..."
            />
          )}
        />
      </ModalCrud>
    </FormProvider>
  )
}

export default BlueprintMissingModal
