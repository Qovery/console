import { useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { type OrganizationPolicyApiToken } from 'qovery-typescript-axios'
import { Suspense } from 'react'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { BlockContent, Button, ExternalLink, Icon, Section, useModal, useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useDeletePolicyApiToken } from '../hooks/use-delete-policy-api-token/use-delete-policy-api-token'
import { PolicyApiTokenCrudModal } from './policy-api-token/policy-api-token-crud-modal'
import { PolicyApiTokenListContent, PolicyApiTokenListSkeleton } from './policy-api-token/policy-api-token-list'

export function SettingsPolicyApiToken() {
  const { organizationId = '' } = useParams({ strict: false })

  useDocumentTitle('Policy API - Organization settings')

  const { mutateAsync: deletePolicyApiToken } = useDeletePolicyApiToken()

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  return (
    <div className="w-full">
      <Section className="px-8 pb-8 pt-6">
        <div className="relative">
          <SettingsHeading
            title="Policy API Token (Beta)"
            description={
              <>
                Policy API tokens are for autonomous agents. Authorization is two gates, and both must open: the Open
                Policy Agent (rego) policy attached to the token is asked first, on every request, and decides whether
                the request proceeds at all; the role the token acts as bounds what it can do once it has. So a policy
                that allows everything grants no more than its role allows &mdash; unlike a plain API token, which has
                only the second gate. Useful when you want a fine grained policy to limit what your token can do and
                change.{' '}
                <ExternalLink href="https://www.qovery.com/docs/configuration/organization/api-policy-token">
                  Learn more
                </ExternalLink>
              </>
            }
          />

          <Button
            className="absolute right-0 top-0"
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

        <BlockContent className="max-w-content-with-navigation-left" title="Policy Token List" classNameContent="p-0">
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
    </div>
  )
}

export default SettingsPolicyApiToken
