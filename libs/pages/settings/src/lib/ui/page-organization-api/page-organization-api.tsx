import { OrganizationApiToken } from 'qovery-typescript-axios'
import { LoadingStatus } from '@qovery/shared/interfaces'
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
import { dateYearMonthDayHourMinuteSecond } from '@qovery/shared/utils'

export interface PageOrganizationContainerRegistriesProps {
  onAddRegistry: () => void
  onDelete: (token: OrganizationApiToken) => void
  apiTokens?: OrganizationApiToken[]
  loading?: LoadingStatus
}

export function PageOrganizationApi(props: PageOrganizationContainerRegistriesProps) {
  const { apiTokens, loading, onAddRegistry, onDelete } = props

  console.log(apiTokens, loading)

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="h5 text-text-700 mb-2">API</h1>
            <p className="text-text-500 text-xs">
              Generate and manage the API tokens to access your organization settings via the Qovery API
            </p>
          </div>
          <Button onClick={() => onAddRegistry()} iconRight={IconAwesomeEnum.CIRCLE_PLUS}>
            Add new
          </Button>
        </div>
        {(loading === 'not loaded' || loading === 'loading') && apiTokens?.length === 0 ? (
          <div data-testid="registries-loader" className="flex justify-center">
            <LoaderSpinner className="w-6" />
          </div>
        ) : apiTokens && apiTokens.length > 0 ? (
          <BlockContent title="Token List" classNameContent="">
            {apiTokens?.map((token: OrganizationApiToken) => (
              <div
                data-testid={`registries-list-${token.id}`}
                key={token.id}
                className="flex justify-between items-center px-5 py-4 border-b border-element-light-lighter-500 last:border-0"
              >
                <div className="flex">
                  <div className="">
                    <h2 className="flex text-xs text-text-600 font-medium mb-1">
                      <Truncate truncateLimit={60} text={token.name || ''} />
                      {token.description && (
                        <Tooltip content={token.description}>
                          <div className="ml-1 cursor-pointer">
                            <Icon name={IconAwesomeEnum.CIRCLE_INFO} className="text-text-400" />
                          </div>
                        </Tooltip>
                      )}
                    </h2>
                    <p className="text-xs text-text-400">
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
                    className="text-text-400 hover:text-text-500 bg-transparent !w-9 !h-8"
                    iconClassName="!text-xs"
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
              title="No container registry"
              description="Define a container registry for your organization"
            />
          )
        )}
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/#container-registry-management',
            linkLabel: 'How to configure my container registry',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageOrganizationApi
