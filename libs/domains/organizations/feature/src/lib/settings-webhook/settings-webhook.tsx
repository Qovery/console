import { useParams } from '@tanstack/react-router'
import { OrganizationWebhookKindEnum, type OrganizationWebhookResponse } from 'qovery-typescript-axios'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { IconEnum } from '@qovery/shared/enums'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { BlockContent, Button, Icon, InputToggle, LoaderSpinner, Section, Tooltip, Truncate } from '@qovery/shared/ui'
import { dateUTCString, timeAgo } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { useDeleteWebhook } from '../hooks/use-delete-webhook/use-delete-webhook'
import { useEditWebhook } from '../hooks/use-edit-webhook/use-edit-webhook'
import { useWebhooks } from '../hooks/use-webhooks/use-webhooks'
import WebhookCrudModalFeature from './webhook-crud-modal-feature/webhook-crud-modal-feature'

interface PageOrganizationWebhooksProps {
  webhookLoading: boolean
  webhooks?: OrganizationWebhookResponse[]
  openAddNew: () => void
  openEdit: (webhook: OrganizationWebhookResponse) => void
  onToggle: (id: string, enabled: boolean) => void
  onDelete: (webhook: OrganizationWebhookResponse) => void
}

function PageOrganizationWebhooks(props: PageOrganizationWebhooksProps) {
  return (
    <div className="w-full">
      <Section className="p-8">
        <div className="relative">
          <SettingsHeading
            title="Webhook"
            description="Qovery allows you to create webhooks at organization-level so that, when an event happens on an
              environment within your organization, you can get notified on external applications (for instance, Slack)."
          />
          <Button size="md" className="absolute right-0 top-0 shrink-0 gap-2" onClick={props.openAddNew}>
            <Icon iconName="circle-plus" iconStyle="regular" />
            Add new
          </Button>
        </div>
        <div className="max-w-content-with-navigation-left">
          <BlockContent title="Webhook" classNameContent="p-0">
            {props.webhookLoading ? (
              <div className="flex justify-center  px-5 py-4">
                <LoaderSpinner className="w-5" />
              </div>
            ) : props.webhooks && props.webhooks?.length > 0 ? (
              <ul className="flex flex-col">
                {props.webhooks?.map((webhook) => (
                  <li
                    key={webhook.id}
                    data-testid="webhook-row"
                    className="flex items-center justify-between border-b border-neutral px-5 py-4 last:border-0"
                  >
                    <div className="flex flex-col">
                      <p className="mb-1 flex text-xs font-medium text-neutral">
                        <Truncate truncateLimit={58} text={webhook.target_url || ''} />
                        {webhook.description && (
                          <Tooltip content={webhook.description}>
                            <div className="ml-1 cursor-pointer">
                              <Icon iconName="circle-info" iconStyle="regular" />
                            </div>
                          </Tooltip>
                        )}
                      </p>
                      <div className="flex gap-3 text-xs text-neutral-subtle">
                        <span className="flex gap-2">
                          <Icon
                            name={
                              webhook.kind === OrganizationWebhookKindEnum.STANDARD ? IconEnum.QOVERY : IconEnum.SLACK
                            }
                            className="h-4 w-4"
                          />{' '}
                          {upperCaseFirstLetter(webhook.kind)}
                        </span>
                        {webhook.updated_at && (
                          <span title={dateUTCString(webhook.updated_at)}>
                            Last updated {timeAgo(new Date(webhook.updated_at))} ago
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <InputToggle
                        title={`${webhook.enabled ? 'Enabled' : 'Disabled'}`}
                        className={`${webhook.enabled ? 'mr-5' : 'mr-4'}`}
                        value={webhook.enabled}
                        small
                        onChange={(e) => props.onToggle(webhook.id, e)}
                      />
                      <Button
                        data-testid="edit-webhook"
                        variant="outline"
                        iconOnly
                        color="neutral"
                        size="md"
                        onClick={() => props.openEdit(webhook)}
                      >
                        <Icon iconName="gear" iconStyle="regular" />
                      </Button>
                      <Button
                        data-testid="delete-webhook"
                        variant="outline"
                        iconOnly
                        color="neutral"
                        size="md"
                        onClick={() => props.onDelete(webhook)}
                      >
                        <Icon iconName="trash-can" iconStyle="regular" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-5 py-4 text-center">
                <Icon iconName="wave-pulse" className="text-neutral-subtle" />
                <p className="mt-1 text-xs font-medium text-neutral-subtle" data-testid="empty-webhook">
                  No webhook found. <br /> Please add one.
                </p>
              </div>
            )}
          </BlockContent>
        </div>
      </Section>
    </div>
  )
}

export function SettingsWebhook() {
  useDocumentTitle('Webhooks - Organization settings')
  const { organizationId = '' } = useParams({ strict: false })
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
      confirmationMethod: 'action',
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
