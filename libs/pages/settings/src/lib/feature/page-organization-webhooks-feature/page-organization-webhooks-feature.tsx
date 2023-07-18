import { OrganizationWebhookResponse } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { useDeleteWebhook, useEditWebhook, useFetchWebhooks } from '@qovery/domains/organization'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import PageOrganizationWebhooks from '../../ui/page-organization-webhooks/page-organization-webhooks'
import WebhookCrudModalFeature from './webhook-crud-modal-feature/webhook-crud-modal-feature'

export function PageOrganizationWebhooksFeature() {
  useDocumentTitle('Webhooks - Organization settings')
  const { organizationId = '' } = useParams()
  const fetchWebhooks = useFetchWebhooks(organizationId)
  const deleteWebhooks = useDeleteWebhook(organizationId)
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const editWebhook = useEditWebhook(organizationId, closeModal)

  const openAddNew = () => {
    openModal({
      content: <WebhookCrudModalFeature organizationId={organizationId} closeModal={closeModal} />,
    })
  }

  const openEdit = (webhook: OrganizationWebhookResponse) => {
    openModal({
      content: <WebhookCrudModalFeature organizationId={organizationId} webhook={webhook} closeModal={closeModal} />,
    })
  }

  const onDelete = (webhook: OrganizationWebhookResponse) => {
    openModalConfirmation({
      title: 'Delete webhook',
      isDelete: true,
      name: webhook.target_url || '',
      action: () => {
        deleteWebhooks.mutate({ webhookId: webhook.id })
      },
    })
  }

  const toggleWebhook = (webhookId: string, enabled: boolean) => {
    // this cast as Required is there to fix an incoherency in the api-doc. If request have all the field required
    // then the Response must also have all the fields defined
    const webhook = fetchWebhooks.data?.find(
      (webhook) => webhook.id === webhookId
    ) as Required<OrganizationWebhookResponse>

    if (webhook !== undefined)
      editWebhook.mutate({
        organizationId,
        webhookId,
        data: {
          ...webhook,
          enabled: enabled,
        },
      })
  }

  return (
    <PageOrganizationWebhooks
      webhooks={fetchWebhooks.data}
      webhookLoading={fetchWebhooks.isLoading}
      openAddNew={openAddNew}
      onToggle={toggleWebhook}
      openEdit={openEdit}
      onDelete={onDelete}
    />
  )
}

export default PageOrganizationWebhooksFeature
