import { OrganizationWebhookResponse } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { useEditWebhook, useFetchWebhooks } from '@qovery/domains/organization'
import { useModal } from '@qovery/shared/ui'
import PageOrganizationWebhooks from '../../ui/page-organization-webhooks/page-organization-webhooks'
import WebhookCrudModalFeature from './webhook-crud-modal-feature/webhook-crud-modal-feature'

export function PageOrganizationWebhooksFeature() {
  const { organizationId = '' } = useParams()
  const fetchWebhooks = useFetchWebhooks(organizationId)
  const { openModal, closeModal } = useModal()
  const editWebhook = useEditWebhook(organizationId, closeModal)

  const openAddNew = () => {
    openModal({
      content: <WebhookCrudModalFeature organizationId={organizationId} closeModal={closeModal} />,
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
    />
  )
}

export default PageOrganizationWebhooksFeature
