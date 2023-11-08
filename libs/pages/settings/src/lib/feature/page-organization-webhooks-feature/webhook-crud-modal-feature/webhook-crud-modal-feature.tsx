import { type OrganizationWebhookCreateRequest, type OrganizationWebhookResponse } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { useCreateWebhook, useEditWebhook } from '@qovery/domains/organizations/feature'
import WebhookCrudModal from '../../../ui/page-organization-webhooks/webhook-crud-modal/webhook-crud-modal'

export interface WebhookCrudModalFeatureProps {
  organizationId: string
  closeModal: () => void
  webhook?: OrganizationWebhookResponse
}

export function WebhookCrudModalFeature({ organizationId, closeModal, webhook }: WebhookCrudModalFeatureProps) {
  const { mutateAsync: createWebhook, isLoading: isLoadingCreateWebhook } = useCreateWebhook({ organizationId })
  const { mutateAsync: editWebhook, isLoading: isLoadingEditWebhook } = useEditWebhook({ organizationId })

  const methods = useForm<OrganizationWebhookCreateRequest>({
    mode: 'all',
    defaultValues: {
      kind: webhook?.kind ?? undefined,
      environment_types_filter: webhook?.environment_types_filter ?? [],
      project_names_filter: webhook?.project_names_filter ?? [],
      events: webhook?.events ?? [],
      description: webhook?.description ?? '',
      target_url: webhook?.target_url ?? '',
      target_secret: '',
    },
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      if (webhook) {
        await editWebhook({
          organizationId,
          webhookId: webhook.id,
          webhookRequest: { ...webhook, ...data },
        })
        closeModal()
      } else {
        await createWebhook({
          organizationId,
          webhookRequest: data,
        })
        closeModal()
      }
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <FormProvider {...methods}>
      <WebhookCrudModal
        closeModal={closeModal}
        onSubmit={onSubmit}
        isEdition={Boolean(webhook)}
        isLoading={isLoadingCreateWebhook || isLoadingEditWebhook}
      />
    </FormProvider>
  )
}

export default WebhookCrudModalFeature
