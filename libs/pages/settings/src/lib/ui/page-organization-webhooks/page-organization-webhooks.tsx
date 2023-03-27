/* eslint-disable-next-line */
import { OrganizationWebhookResponse } from 'qovery-typescript-axios'
import { IconEnum } from '@qovery/shared/enums'
import {
  BlockContent,
  Button,
  HelpSection,
  Icon,
  IconAwesomeEnum,
  InputToggle,
  Link,
  LoaderSpinner,
} from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/utils'

export interface PageOrganizationWebhooksProps {
  webhookLoading: boolean
  webhooks?: OrganizationWebhookResponse[]
  openAddNew: () => void
  onToggle: (id: string, enabled: boolean) => void
}

export function PageOrganizationWebhooks(props: PageOrganizationWebhooksProps) {
  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <div className="flex justify-between mb-8 gap-3">
          <div>
            <h1 className="h5 text-text-700 mb-2">
              Webhook <Icon name={IconEnum.SLACK} />
            </h1>
            <p className="text-text-500 text-xs">
              Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis
              mollit. Exercitation veniam consequat sunt nostrud amet.
            </p>
          </div>
          <Button onClick={props.openAddNew} iconRight={IconAwesomeEnum.CIRCLE_PLUS} className="shrink-0">
            Add new
          </Button>
        </div>
        <BlockContent title="Webhook">
          {props.webhookLoading ? (
            <div className="flex justify-center">
              <LoaderSpinner className="w-5" />
            </div>
          ) : props.webhooks && props.webhooks?.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {props.webhooks?.map((webhook) => (
                <li key={webhook.id} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <Link link={webhook.target_url || ''} linkLabel={webhook.target_url} external></Link>
                    <div className="text-xs text-text-400 flex gap-3">
                      <span>{webhook.kind}</span>
                      <span className="text-brand-500 font-medium cursor-pointer">{webhook.events?.length} events</span>
                      <span>{timeAgo(new Date(webhook.updated_at || ''))}</span>
                    </div>
                  </div>
                  <div>
                    <InputToggle
                      title="Enabled"
                      value={webhook.enabled}
                      small
                      onChange={(e) => props.onToggle(webhook.id, e)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div data-testid="placeholder-credit-card" className="text-center px-3 py-6">
              <Icon name={IconAwesomeEnum.WAVE_PULSE} className="text-text-400" />
              <p className="text-text-400 font-medium text-xs mt-1" data-testid="empty-credit-card">
                No webhook found. <br /> Please add one.
              </p>
            </div>
          )}
        </BlockContent>
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/#managing-git-permissions-using-the-qovery-github-app',
            linkLabel: 'Managing Git Permissions Using the Qovery Github application',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageOrganizationWebhooks
