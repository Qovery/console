import { OrganizationWebhookKindEnum, type OrganizationWebhookResponse } from 'qovery-typescript-axios'
import { NeedHelp } from '@qovery/shared/assistant/feature'
import { IconEnum } from '@qovery/shared/enums'
import {
  BlockContent,
  Button,
  Heading,
  Icon,
  InputToggle,
  LoaderSpinner,
  Section,
  Tooltip,
  Truncate,
} from '@qovery/shared/ui'
import { dateUTCString, timeAgo } from '@qovery/shared/util-dates'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface PageOrganizationWebhooksProps {
  webhookLoading: boolean
  webhooks?: OrganizationWebhookResponse[]
  openAddNew: () => void
  openEdit: (webhook: OrganizationWebhookResponse) => void
  onToggle: (id: string, enabled: boolean) => void
  onDelete: (webhook: OrganizationWebhookResponse) => void
}

export function PageOrganizationWebhooks(props: PageOrganizationWebhooksProps) {
  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <div className="mb-8 flex justify-between gap-2">
          <div className="space-y-3">
            <Heading>Webhook</Heading>
            <p className="text-xs text-neutral-400">
              Qovery allows you to create webhooks at organization-level so that, when an event happens on an
              environment within your organization, you can get notified on external applications (for instance, Slack).
            </p>
            <NeedHelp />
          </div>
          <Button data-testid="add-new" onClick={props.openAddNew} size="md" className="shrink-0 gap-2">
            Add new
            <Icon iconName="circle-plus" iconStyle="regular" />
          </Button>
        </div>
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
                  className="flex items-center justify-between border-b border-neutral-250 px-5 py-4 last:border-0"
                >
                  <div className="flex flex-col">
                    <p className="mb-1 flex text-xs font-medium text-neutral-400">
                      <Truncate truncateLimit={58} text={webhook.target_url || ''} />
                      {webhook.description && (
                        <Tooltip content={webhook.description}>
                          <div className="ml-1 cursor-pointer">
                            <Icon iconName="circle-info" iconStyle="regular" />
                          </div>
                        </Tooltip>
                      )}
                    </p>
                    <div className="flex gap-3 text-xs text-neutral-350">
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
                      type="button"
                      variant="surface"
                      color="neutral"
                      size="md"
                      onClick={() => props.openEdit(webhook)}
                    >
                      <Icon iconName="gear" iconStyle="regular" />
                    </Button>
                    <Button
                      data-testid="delete-webhook"
                      type="button"
                      variant="surface"
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
              <Icon iconName="wave-pulse" className="text-neutral-350" />
              <p className="mt-1 text-xs font-medium text-neutral-350" data-testid="empty-webhook">
                No webhook found. <br /> Please add one.
              </p>
            </div>
          )}
        </BlockContent>
      </Section>
    </div>
  )
}

export default PageOrganizationWebhooks
