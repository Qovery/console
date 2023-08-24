import { type OrganizationWebhookCreateRequest, type OrganizationWebhookResponse } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { useCreateWebhook, useEditWebhook } from '@qovery/domains/organization'
import WebhookCrudModal from '../../../ui/page-organization-webhooks/webhook-crud-modal/webhook-crud-modal'

export interface WebhookCrudModalFeatureProps {
  organizationId: string
  closeModal: () => void
  webhook?: OrganizationWebhookResponse
}

export function WebhookCrudModalFeature(props: WebhookCrudModalFeatureProps) {
  const createWebhooks = useCreateWebhook(props.organizationId, props.closeModal)
  const editWebhook = useEditWebhook(props.organizationId, props.closeModal)

  const methods = useForm<OrganizationWebhookCreateRequest>({
    mode: 'all',
    defaultValues: {
      kind: props.webhook?.kind ?? undefined,
      environment_types_filter: props.webhook?.environment_types_filter ?? [],
      project_names_filter: props.webhook?.project_names_filter ?? [],
      events: props.webhook?.events ?? [],
      description: props.webhook?.description ?? '',
      target_url: props.webhook?.target_url ?? '',
      target_secret: '',
    },
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (props.webhook) {
      editWebhook.mutate({
        organizationId: props.organizationId,
        webhookId: props.webhook.id,
        data: { ...props.webhook, ...data },
      })
    } else {
      createWebhooks.mutate({ organizationId: props.organizationId, data })
    }
  })

  return (
    <FormProvider {...methods}>
      <WebhookCrudModal
        closeModal={props.closeModal}
        onSubmit={onSubmit}
        isEdition={Boolean(props.webhook)}
        isLoading={editWebhook.isLoading || createWebhooks.isLoading}
      />
    </FormProvider>
  )
}

export default WebhookCrudModalFeature
