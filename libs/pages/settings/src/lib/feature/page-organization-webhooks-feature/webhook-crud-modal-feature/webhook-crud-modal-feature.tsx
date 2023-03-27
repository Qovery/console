import { OrganizationWebhookCreateRequest } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { useCreateWebhooks } from '@qovery/domains/organization'
import WebhookCrudModal from '../../../ui/page-organization-webhooks/webhook-crud-modal/webhook-crud-modal'

export interface WebhookCrudModalFeatureProps {
  organizationId: string
  closeModal: () => void
}

export function WebhookCrudModalFeature(props: WebhookCrudModalFeatureProps) {
  const createWebhooks = useCreateWebhooks(props.organizationId, props.closeModal)

  const methods = useForm<OrganizationWebhookCreateRequest>({
    mode: 'all',
    defaultValues: {
      environment_types_filter: [],
      project_names_filter: [],
      events: [],
    },
  })

  const onSubmit = methods.handleSubmit((data) => {
    createWebhooks.mutate({ organizationId: props.organizationId, data })
  })

  return (
    <FormProvider {...methods}>
      <WebhookCrudModal closeModal={props.closeModal} onSubmit={onSubmit} />
    </FormProvider>
  )
}

export default WebhookCrudModalFeature
