import { type OrganizationWebhookResponse } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { useDeleteWebhook, useEditWebhook, useWebhooks } from '@qovery/domains/organizations/feature'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import PageOrganizationWebhooks from '../../ui/page-organization-webhooks/page-organization-webhooks'
import WebhookCrudModalFeature from './webhook-crud-modal-feature/webhook-crud-modal-feature'

export function PageOrganizationWebhooksFeature() {
  useDocumentTitle('Webhooks - Organization settings')
  const { organizationId = '' } = useParams()
  const fetchWebhooks = useWebhooks({ organizationId })
  const { mutateAsync: deleteWebhook } = useDeleteWebhook()
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { mutateAsync: editWebhook } = useEditWebhook()

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
        try {
          deleteWebhook({ organizationId, webhookId: webhook.id })
        } catch (error) {
          console.error(error)
        }
      },
    })
  }

  const toggleWebhook = (webhookId: string, enabled: boolean) => {
    // this cast as Required is there to fix an incoherency in the api-doc. If request have all the field required
    // then the Response must also have all the fields defined
    const webhook = fetchWebhooks.data?.find(
      (webhook) => webhook.id === webhookId
    ) as Required<OrganizationWebhookResponse>

    if (webhook !== undefined) {
      try {
        editWebhook({
          organizationId,
          webhookId,
          webhookRequest: {
            ...webhook,
            enabled: enabled,
          },
        })
        closeModal()
      } catch (error) {
        console.error(error)
      }
    }
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
