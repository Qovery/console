import { type OrganizationApiToken } from 'qovery-typescript-axios'
import { type LoadingStatus } from '@qovery/shared/interfaces'
import {
  BlockContent,
  Button,
  ButtonIcon,
  ButtonIconStyle,
  ButtonSize,
  EmptyState,
  HelpSection,
  Icon,
  IconAwesomeEnum,
  LoaderSpinner,
  Tooltip,
  Truncate,
} from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond } from '@qovery/shared/util-dates'

export interface PageOrganizationApiProps {
  onAddToken: () => void
  onDelete: (token: OrganizationApiToken) => void
  apiTokens?: OrganizationApiToken[]
  loading?: LoadingStatus
}

export function PageOrganizationApi(props: PageOrganizationApiProps) {
  const { apiTokens, loading, onAddToken, onDelete } = props

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="h5 text-neutral-400 mb-2">API Token</h1>
            <p className="text-neutral-400 text-xs">
              API token allows third-party applications or script to access your organization via the Qovery API (CI/CD,
              Terraform script, Pulumi etc..)
            </p>
          </div>
          <Button className="shrink-0" onClick={() => onAddToken()} iconRight={IconAwesomeEnum.CIRCLE_PLUS}>
            Add new
          </Button>
        </div>
        {(loading === 'not loaded' || loading === 'loading') && apiTokens?.length === 0 ? (
          <div data-testid="loader" className="flex justify-center">
            <LoaderSpinner className="w-6" />
          </div>
        ) : apiTokens && apiTokens.length > 0 ? (
          <BlockContent title="Token List" classNameContent="p-0">
            {apiTokens?.map((token: OrganizationApiToken) => (
              <div
                data-testid={`token-list-${token.id}`}
                key={token.id}
                className="flex justify-between items-center px-5 py-4 border-b border-neutral-250 last:border-0"
              >
                <div className="flex">
                  <div className="">
                    <h2 className="flex text-xs text-neutral-400 font-medium mb-1">
                      <Truncate truncateLimit={60} text={token.name || ''} />
                      {token.description && (
                        <Tooltip content={token.description}>
                          <div className="ml-1 cursor-pointer">
                            <Icon name={IconAwesomeEnum.CIRCLE_INFO} className="text-neutral-350" />
                          </div>
                        </Tooltip>
                      )}
                    </h2>
                    <p className="text-xs text-neutral-350">
                      <span className="inline-block">
                        Created since {dateYearMonthDayHourMinuteSecond(new Date(token.created_at || ''), false)}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <ButtonIcon
                    icon={IconAwesomeEnum.TRASH}
                    style={ButtonIconStyle.STROKED}
                    size={ButtonSize.TINY}
                    onClick={() => onDelete(token)}
                    className="text-neutral-350 hover:text-neutral-400 bg-transparent !w-9 !h-8"
                    iconClassName="!text-xs"
                    dataTestId="delete-token"
                  />
                </div>
              </div>
            ))}
          </BlockContent>
        ) : (
          loading === 'loaded' &&
          apiTokens?.length === 0 && (
            <EmptyState
              dataTestId="empty-state"
              title="No API token found"
              description="Define an API token for your organization"
            />
          )
        )}
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/api-token',
            linkLabel: 'How to configure the Token API',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageOrganizationApi
