import { type OrganizationApiToken } from 'qovery-typescript-axios'
import { NeedHelp } from '@qovery/shared/assistant/feature'
import { BlockContent, Button, Heading, Icon, LoaderSpinner, Section, Tooltip, Truncate } from '@qovery/shared/ui'
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
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <div className="mb-8 flex justify-between gap-2">
          <div className="space-y-3">
            <Heading className="text-neutral-400">API Token</Heading>
            <p className="text-xs text-neutral-400">
              API token allows third-party applications or script to access your organization via the Qovery API (CI/CD,
              Terraform script, Pulumi etc..). A role can be assigned to limit the Token permission.
            </p>
            <NeedHelp />
          </div>
          <Button className="shrink-0 gap-2" size="md" onClick={() => onAddToken()}>
            Add new
            <Icon iconName="circle-plus" iconStyle="regular" />
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
                  className="flex items-center justify-between border-b border-neutral-250 px-5 py-4 last:border-0"
                >
                  <div className="flex">
                    <div className="">
                      <h2 className="mb-1 flex text-xs font-medium text-neutral-400">
                        <Truncate truncateLimit={60} text={token.name || ''} />
                        {token.description && (
                          <Tooltip content={token.description}>
                            <div className="ml-1 cursor-pointer">
                              <Icon iconName="circle-info" iconStyle="regular" />
                            </div>
                          </Tooltip>
                        )}
                      </h2>
                      <p className="text-xs text-neutral-350">
                        <span className="mr-3 inline-block">Role: {upperCaseFirstLetter(token.role_name)}</span>
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
                      variant="surface"
                      color="neutral"
                      size="md"
                      onClick={() => onDelete(token)}
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
              <p className="mt-1 text-xs font-medium text-neutral-350">
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
