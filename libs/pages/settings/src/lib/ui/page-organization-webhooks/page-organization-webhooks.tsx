import { OrganizationWebhookKindEnum, type OrganizationWebhookResponse } from 'qovery-typescript-axios'
import { IconEnum } from '@qovery/shared/enums'
import {
  BlockContent,
  Button,
  ButtonIcon,
  ButtonIconStyle,
  ButtonLegacySize,
  Heading,
  HelpSection,
  Icon,
  IconAwesomeEnum,
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
    <div className="flex flex-col justify-between w-full">
      <Section className="p-8 max-w-content-with-navigation-left">
        <div className="flex justify-between mb-8 gap-3">
          <div>
            <Heading className="mb-2">Webhook</Heading>
            <p className="text-neutral-400 text-xs">
              Qovery allows you to create webhooks at organization-level so that, when an event happens on an
              environment within your organization, you can get notified on external applications (for instance, Slack).
            </p>
          </div>
          <Button data-testid="add-new" onClick={props.openAddNew} size="lg" className="gap-2 shrink-0">
            Add new
            <Icon iconName="circle-plus" />
          </Button>
        </div>
        <BlockContent title="Webhook" classNameContent="p-0">
          {props.webhookLoading ? (
            <div className="flex justify-center  py-4 px-5">
              <LoaderSpinner className="w-5" />
            </div>
          ) : props.webhooks && props.webhooks?.length > 0 ? (
            <ul className="flex flex-col">
              {props.webhooks?.map((webhook) => (
                <li
                  key={webhook.id}
                  data-testid="webhook-row"
                  className="flex items-center justify-between border-b border-neutral-250 py-4 px-5 last:border-0"
                >
                  <div className="flex flex-col">
                    <p className="flex text-neutral-400 font-medium text-xs mb-1">
                      <Truncate truncateLimit={60} text={webhook.target_url || ''} />
                      {webhook.description && (
                        <Tooltip content={webhook.description}>
                          <div className="ml-1 cursor-pointer">
                            <Icon iconName="circle-info" className="text-neutral-350" />
                          </div>
                        </Tooltip>
                      )}
                    </p>
                    <div className="text-xs text-neutral-350 flex gap-3">
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
                  <div className="flex items-center">
                    <InputToggle
                      title={`${webhook.enabled ? 'Enabled' : 'Disabled'}`}
                      className={`${webhook.enabled ? 'mr-5' : 'mr-4'}`}
                      value={webhook.enabled}
                      small
                      onChange={(e) => props.onToggle(webhook.id, e)}
                    />

                    <ButtonIcon
                      icon={IconAwesomeEnum.WHEEL}
                      style={ButtonIconStyle.STROKED}
                      size={ButtonLegacySize.TINY}
                      onClick={() => props.openEdit(webhook)}
                      className="text-neutral-350 hover:text-neutral-400 bg-transparent !w-9 !h-8 mr-2"
                      iconClassName="!text-xs"
                      dataTestId="edit-webhook"
                    />
                    <ButtonIcon
                      icon={IconAwesomeEnum.TRASH}
                      style={ButtonIconStyle.STROKED}
                      size={ButtonLegacySize.TINY}
                      onClick={() => props.onDelete(webhook)}
                      dataTestId="delete-webhook"
                      className="text-neutral-350 hover:text-neutral-400 bg-transparent !w-9 !h-8"
                      iconClassName="!text-xs"
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4 px-5">
              <Icon iconName="wave-pulse" className="text-neutral-350" />
              <p className="text-neutral-350 font-medium text-xs mt-1" data-testid="empty-webhook">
                No webhook found. <br /> Please add one.
              </p>
            </div>
          )}
        </BlockContent>
      </Section>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/integration/webhook/',
            linkLabel: 'Managing your Webhooks',
          },
        ]}
      />
    </div>
  )
}

export default PageOrganizationWebhooks
