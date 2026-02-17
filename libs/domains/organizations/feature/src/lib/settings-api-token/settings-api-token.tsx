import { useParams } from '@tanstack/react-router'
import { type OrganizationApiToken } from 'qovery-typescript-axios'
import { Suspense } from 'react'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { BlockContent, Button, Icon, Section, Skeleton, Tooltip, Truncate } from '@qovery/shared/ui'
import { dateMediumLocalFormat, dateUTCString } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { useApiTokens } from '../hooks/use-api-tokens/use-api-tokens'
import { useDeleteApiToken } from '../hooks/use-delete-api-token/use-delete-api-token'
import CrudModalFeature from './crud-modal-feature/crud-modal-feature'

interface PageOrganizationApiProps {
  onAddToken: () => void
  onDelete: (token: OrganizationApiToken) => void
  apiTokens: OrganizationApiToken[]
}

function PageOrganizationApi(props: PageOrganizationApiProps) {
  const { apiTokens, onAddToken, onDelete } = props

  return (
    <div className="w-full">
      <Section className="p-8">
        <div className="relative">
          <SettingsHeading
            title="API Token"
            description="API token allows third-party applications or script to access your organization via the Qovery API (CI/CD,
              Terraform script, Pulumi etc..). A role can be assigned to limit the Token permission."
          />

          <Button className="absolute right-0 top-0 gap-2" size="md" onClick={() => onAddToken()}>
            <Icon iconName="circle-plus" iconStyle="regular" />
            Add new
          </Button>
        </div>
        <div className="max-w-content-with-navigation-left">
          <BlockContent title="Token List" classNameContent="p-0">
            {apiTokens.length > 0 ? (
              <ul>
                {apiTokens.map((token: OrganizationApiToken) => (
                  <li
                    data-testid={`token-list-${token.id}`}
                    key={token.id}
                    className="flex items-center justify-between border-b border-neutral px-5 py-4 last:border-0"
                  >
                    <div className="flex">
                      <div className="">
                        <h2 className="mb-1 flex text-xs font-medium text-neutral">
                          <Truncate truncateLimit={60} text={token.name || ''} />
                          {token.description && (
                            <Tooltip content={token.description}>
                              <div className="ml-1 cursor-pointer">
                                <Icon iconName="circle-info" iconStyle="regular" />
                              </div>
                            </Tooltip>
                          )}
                        </h2>
                        <p className="text-xs text-neutral-subtle">
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
                        variant="outline"
                        iconOnly
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
                <Icon iconName="wave-pulse" className="text-neutral-subtle" />
                <p className="mt-1 text-xs font-medium text-neutral-subtle">
                  No Api Token found. <br /> Please add one.
                </p>
              </div>
            )}
          </BlockContent>
        </div>
      </Section>
    </div>
  )
}

const SettingsApiTokenSkeleton = () => (
  <div className="w-full">
    <Section className="p-8">
      <div className="relative mb-8 border-b border-neutral">
        <div className="space-y-2 pb-6">
          <Skeleton width={120} height={32} show={true} />
          <Skeleton width={520} height={40} show={true} />
          <Skeleton width={420} height={24} show={true} />
        </div>
        <Skeleton className="absolute right-0 top-0" width={110} height={36} show={true} />
      </div>
      <div className="max-w-content-with-navigation-left">
        <div className="mb-5 rounded border border-neutral bg-surface-neutral-subtle">
          <div className="flex h-9 items-center justify-between border-b border-neutral px-4">
            <Skeleton width={90} height={12} show={true} />
          </div>
          <div className="p-0">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-neutral px-5 py-4 last:border-0"
              >
                <div className="space-y-2">
                  <Skeleton width={200} height={12} show={true} />
                  <Skeleton width={260} height={12} show={true} />
                </div>
                <Skeleton width={36} height={36} show={true} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  </div>
)

interface SettingsApiTokenContentProps {
  organizationId: string
  onAddToken: () => void
  onDelete: (token: OrganizationApiToken) => void
}

function SettingsApiTokenContent({ organizationId, onAddToken, onDelete }: SettingsApiTokenContentProps) {
  const { data: apiTokens = [] } = useApiTokens({ organizationId, suspense: true })

  return <PageOrganizationApi apiTokens={apiTokens} onAddToken={onAddToken} onDelete={onDelete} />
}

export function SettingsApiToken() {
  const { organizationId = '' } = useParams({ strict: false })

  useDocumentTitle('API - Organization settings')

  const { mutateAsync: deleteApiToken } = useDeleteApiToken()

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  return (
    <Suspense fallback={<SettingsApiTokenSkeleton />}>
      <SettingsApiTokenContent
        organizationId={organizationId}
        onAddToken={() => {
          openModal({ content: <CrudModalFeature organizationId={organizationId} onClose={closeModal} /> })
        }}
        onDelete={(token: OrganizationApiToken) => {
          openModalConfirmation({
            title: 'Delete API token',
            confirmationMethod: 'action',
            name: token?.name,
            action: () => {
              try {
                deleteApiToken({ organizationId, apiTokenId: token.id })
              } catch (error) {
                console.error(error)
              }
            },
          })
        }}
      />
    </Suspense>
  )
}
