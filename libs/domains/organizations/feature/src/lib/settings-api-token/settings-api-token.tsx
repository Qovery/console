import { useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { type OrganizationApiToken, type OrganizationPolicyApiToken } from 'qovery-typescript-axios'
import { Suspense } from 'react'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import {
  BlockContent,
  Button,
  ExternalLink,
  Heading,
  Icon,
  Section,
  Skeleton,
  Tooltip,
  Truncate,
} from '@qovery/shared/ui'
import { dateMediumLocalFormat, dateUTCString } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { useApiTokens } from '../hooks/use-api-tokens/use-api-tokens'
import { useDeleteApiToken } from '../hooks/use-delete-api-token/use-delete-api-token'
import { useDeletePolicyApiToken } from '../hooks/use-delete-policy-api-token/use-delete-policy-api-token'
import CrudModalFeature from './crud-modal-feature/crud-modal-feature'
import { PolicyApiTokenCrudModal } from './policy-api-token/policy-api-token-crud-modal'
import { PolicyApiTokenListContent, PolicyApiTokenListSkeleton } from './policy-api-token/policy-api-token-list'

interface PageOrganizationApiProps {
  onDelete: (token: OrganizationApiToken) => void
  apiTokens: OrganizationApiToken[]
}

function PageOrganizationApi(props: PageOrganizationApiProps) {
  const { apiTokens, onDelete } = props

  return (
    <div className="max-w-content-with-navigation-left">
      <BlockContent title="Token List" classNameContent="p-0">
        {apiTokens.length > 0 ? (
          <ul>
            {apiTokens.map((token: OrganizationApiToken) => (
              <li
                data-testid={`token-list-${token.id}`}
                key={token.id}
                className="flex items-center justify-between border-b border-neutral p-4 last:border-0"
              >
                <div className="flex">
                  <div>
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
          <div className="p-4 text-center">
            <Icon iconName="wave-pulse" className="text-neutral-subtle" />
            <p className="mt-1 text-xs font-medium text-neutral-subtle">
              No Api Token found. <br /> Please add one.
            </p>
          </div>
        )}
      </BlockContent>
    </div>
  )
}

const SettingsApiTokenSkeleton = () => (
  <div className="max-w-content-with-navigation-left">
    <BlockContent title="Token List" classNameContent="p-0">
      {[0, 1, 2, 3].map((index) => (
        <div key={index} className="flex items-center justify-between border-b border-neutral p-4 last:border-0">
          <div className="space-y-2">
            <Skeleton width={200} height={12} show={true} />
            <Skeleton width={260} height={12} show={true} />
          </div>
          <Skeleton width={32} height={32} show={true} />
        </div>
      ))}
    </BlockContent>
  </div>
)

interface SettingsApiTokenContentProps {
  organizationId: string
  onDelete: (token: OrganizationApiToken) => void
}

function SettingsApiTokenContent({ organizationId, onDelete }: SettingsApiTokenContentProps) {
  const { data: apiTokens = [] } = useApiTokens({ organizationId, suspense: true })

  return <PageOrganizationApi apiTokens={apiTokens} onDelete={onDelete} />
}

export function SettingsApiToken() {
  const { organizationId = '' } = useParams({ strict: false })

  useDocumentTitle('API - Organization settings')

  const { mutateAsync: deleteApiToken } = useDeleteApiToken()
  const { mutateAsync: deletePolicyApiToken } = useDeletePolicyApiToken()

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  return (
    <div className="w-full">
      <Section className="px-8 pb-8 pt-6">
        <div className="relative">
          <SettingsHeading
            title="API Token"
            description="API token allows third-party applications or script to access your organization via the Qovery API (CI/CD,
              Terraform script, Pulumi etc..). A role can be assigned to limit the Token permission."
          />

          <Button
            className="absolute right-0 top-0"
            size="md"
            onClick={() => {
              openModal({ content: <CrudModalFeature organizationId={organizationId} onClose={closeModal} /> })
            }}
          >
            <Icon iconName="circle-plus" iconStyle="regular" />
            Add new
          </Button>
        </div>
        <Suspense fallback={<SettingsApiTokenSkeleton />}>
          <SettingsApiTokenContent
            organizationId={organizationId}
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

        {/*
          A sub-section of this page rather than a second page: SettingsHeading renders the h1 and
          the bottom rule that mark the top of a settings page, so a second one reads as though the
          page started over. Nesting a Section is what steps LevelContext down, so Heading resolves
          to an h2 on its own and the sub-section stays in the same column as the block above.
        */}
        <Section className="mt-8 max-w-content-with-navigation-left">
          <div className="flex items-center justify-between gap-4">
            <Heading>Policy API Token (Beta)</Heading>

            <Button
              size="md"
              aria-label="Add new policy API token"
              onClick={() => {
                posthog.capture('policy-api-token-add-clicked', {
                  organization_id: organizationId,
                })
                openModal({
                  content: <PolicyApiTokenCrudModal organizationId={organizationId} onClose={closeModal} />,
                })
              }}
            >
              <Icon iconName="circle-plus" iconStyle="regular" />
              Add new
            </Button>
          </div>
          <p className="mt-1 text-sm text-neutral-subtle">
            Policy API tokens are for autonomous agents. Authorization is two gates, and both must open: the Open Policy
            Agent (rego) policy attached to the token is asked first, on every request, and decides whether the request
            proceeds at all; the role the token acts as bounds what it can do once it has. So a policy that allows
            everything grants no more than its role allows &mdash; unlike a plain API token, which has only the second
            gate. Useful when you want a fine grained policy to limit what your token can do and change.
            <ExternalLink href="https://www.qovery.com/docs/configuration/organization/api-policy-token">
              Learn more
            </ExternalLink>
          </p>

          <BlockContent className="mt-4" title="Policy Token List" classNameContent="p-0">
            <Suspense fallback={<PolicyApiTokenListSkeleton />}>
              <PolicyApiTokenListContent
                organizationId={organizationId}
                onDelete={(token: OrganizationPolicyApiToken) => {
                  openModalConfirmation({
                    title: 'Delete Policy API token',
                    confirmationMethod: 'action',
                    name: token?.name,
                    action: () => {
                      try {
                        deletePolicyApiToken({ organizationId, policyApiTokenId: token.id })
                      } catch (error) {
                        console.error(error)
                      }
                    },
                  })
                }}
              />
            </Suspense>
          </BlockContent>
        </Section>
      </Section>
    </div>
  )
}
