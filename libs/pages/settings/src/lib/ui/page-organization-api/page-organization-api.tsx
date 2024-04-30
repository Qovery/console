import { type OrganizationApiToken } from 'qovery-typescript-axios'
import {
  BlockContent,
  Button,
  ButtonIcon,
  ButtonIconStyle,
  ButtonLegacySize,
  Heading,
  Icon,
  IconAwesomeEnum,
  LoaderSpinner,
  Section,
  Tooltip,
  Truncate,
} from '@qovery/shared/ui'
import { dateMediumLocalFormat, dateUTCString } from '@qovery/shared/util-dates'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface PageOrganizationApiProps {
  onAddToken: () => void
  onDelete: (token: OrganizationApiToken) => void
  apiTokens?: OrganizationApiToken[]
  isFetched: boolean
}

export function PageOrganizationApi(props: PageOrganizationApiProps) {
  const { apiTokens, isFetched, onAddToken, onDelete } = props

  return (
    <div className="flex flex-col justify-between w-full">
      <Section className="p-8 max-w-content-with-navigation-left">
        <div className="flex justify-between mb-8">
          <div>
            <Heading className="h5 text-neutral-400 mb-2">API Token</Heading>
            <p className="text-neutral-400 text-xs">
              API token allows third-party applications or script to access your organization via the Qovery API (CI/CD,
              Terraform script, Pulumi etc..). A role can be assigned to limit the Token permission.
            </p>
          </div>
          <Button className="shrink-0 gap-2" size="lg" onClick={() => onAddToken()}>
            Add new
            <Icon iconName="circle-plus" />
          </Button>
        </div>
        <BlockContent title="Token List" classNameContent="p-0">
          {!isFetched ? (
            <div className="flex justify-center p-5">
              <LoaderSpinner className="w-5" />
            </div>
          ) : apiTokens && apiTokens.length > 0 ? (
            <ul>
              {apiTokens?.map((token: OrganizationApiToken) => (
                <li
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
                              <Icon iconName="circle-info" className="text-neutral-350" />
                            </div>
                          </Tooltip>
                        )}
                      </h2>
                      <p className="text-xs text-neutral-350">
                        <span className="inline-block mr-3">Role: {upperCaseFirstLetter(token.role_name)}</span>
                        {token.created_at && (
                          <span className="inline-block" title={dateUTCString(token.created_at)}>
                            Created since {dateMediumLocalFormat(token.created_at)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Button
                      data-testid="delete-token"
                      variant="outline"
                      color="neutral"
                      size="md"
                      onClick={() => onDelete(token)}
                    >
                      <Icon iconName="trash" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4 px-5">
              <Icon iconName="wave-pulse" className="text-neutral-350" />
              <p className="text-neutral-350 font-medium text-xs mt-1">
                No Api Token found. <br /> Please add one.
              </p>
            </div>
          )}
        </BlockContent>
      </Section>
    </div>
  )
}

export default PageOrganizationApi
