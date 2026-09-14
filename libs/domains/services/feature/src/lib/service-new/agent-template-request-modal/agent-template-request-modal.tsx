import posthog from 'posthog-js'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { InputTextArea, ModalCrud, toast } from '@qovery/shared/ui'

export interface AgentTemplateRequestModalProps {
  organizationId: string
  onClose: () => void
}

type AgentTemplateRequestFormValues = {
  message: string
}

export function AgentTemplateRequestModal({ organizationId, onClose }: AgentTemplateRequestModalProps) {
  const methods = useForm<AgentTemplateRequestFormValues>({
    defaultValues: { message: '' },
    mode: 'onChange',
  })

  const handleSubmit = methods.handleSubmit((data) => {
    posthog.capture('agent-template-request-feedback', {
      message: data.message.trim(),
      organization_id: organizationId,
    })
    toast('success', 'Thanks for the feedback!', "We'll let you know when it's available.")
    onClose()
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Request a new template"
        description="Tell us which agent template you'd like Qovery to add next."
        onSubmit={handleSubmit}
        onClose={onClose}
        submitLabel="Send request"
      >
        <Controller
          name="message"
          control={methods.control}
          rules={{ validate: (value: string) => value.trim().length > 0 || 'Please describe the template you need.' }}
          render={({ field, fieldState: { error } }) => (
            <InputTextArea
              className="w-full"
              label="Which template is missing?"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              error={error?.message}
              hint="e.g. Incident response, pull request review, cost optimization..."
            />
          )}
        />
      </ModalCrud>
    </FormProvider>
  )
}

export default AgentTemplateRequestModal
