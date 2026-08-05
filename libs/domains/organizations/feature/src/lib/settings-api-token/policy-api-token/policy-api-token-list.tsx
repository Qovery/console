import { type OrganizationPolicyApiToken } from 'qovery-typescript-axios'
import { Button, EmptyState, Icon, Skeleton, Tooltip, Truncate, useModal } from '@qovery/shared/ui'
import { dateMediumLocalFormat, dateUTCString } from '@qovery/shared/util-dates'
import { usePolicyApiTokens } from '../../hooks/use-policy-api-tokens/use-policy-api-tokens'
import { PolicyApiTokenPolicyModal } from './policy-api-token-policy-modal'

export interface PolicyApiTokenListProps {
  policyApiTokens: OrganizationPolicyApiToken[]
  onDelete: (token: OrganizationPolicyApiToken) => void
}

export function PolicyApiTokenList({ policyApiTokens, onDelete }: PolicyApiTokenListProps) {
  const { openModal, closeModal } = useModal()

  if (policyApiTokens.length === 0) {
    return (
      <EmptyState
        // Compact, and without the border and background it draws by default: this renders inside
        // a BlockContent, which is already the bordered card.
        size="sm"
        className="border-0 bg-transparent"
        icon="wave-pulse"
        iconStyle="regular"
        title="No Policy API Token found"
        description="Add one to give an autonomous agent access constrained by a rego policy."
      />
    )
  }

  return (
    <ul>
      {policyApiTokens.map((token) => (
        <li
          key={token.id}
          data-testid={`policy-token-list-${token.id}`}
          className="flex items-center justify-between border-b border-neutral p-4 last:border-0"
        >
          <div>
            <h3 className="mb-1 flex text-xs font-medium text-neutral">
              <Truncate truncateLimit={60} text={token.name || ''} />
              {token.description && (
                <Tooltip content={token.description}>
                  <div className="ml-1 cursor-pointer">
                    <Icon iconName="circle-info" iconStyle="regular" />
                  </div>
                </Tooltip>
              )}
            </h3>
            <p className="text-xs text-neutral-subtle">
              {token.creator_name && <span className="mr-3 inline-block">Created by {token.creator_name}</span>}
              {token.created_at && (
                <span className="inline-block" title={dateUTCString(token.created_at)}>
                  Created since {dateMediumLocalFormat(token.created_at)}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip content="Inspect policy">
              <Button
                data-testid="inspect-policy"
                variant="outline"
                iconOnly
                color="neutral"
                size="md"
                aria-label={`Inspect policy of ${token.name}`}
                onClick={() =>
                  openModal({
                    content: <PolicyApiTokenPolicyModal token={token} onClose={closeModal} />,
                    // Wider than the default: a policy is code, and wrapping it makes it harder to read.
                    options: { width: 680 },
                  })
                }
              >
                <Icon iconName="scroll" iconStyle="regular" />
              </Button>
            </Tooltip>
            <Button
              data-testid="delete-policy-token"
              variant="outline"
              iconOnly
              color="neutral"
              size="md"
              onClick={() => onDelete(token)}
              aria-label={`Delete ${token.name}`}
            >
              <Icon iconName="trash-can" iconStyle="regular" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}

export interface PolicyApiTokenListContentProps {
  organizationId: string
  onDelete: (token: OrganizationPolicyApiToken) => void
}

export function PolicyApiTokenListContent({ organizationId, onDelete }: PolicyApiTokenListContentProps) {
  const { data: policyApiTokens = [] } = usePolicyApiTokens({ organizationId, suspense: true })

  return <PolicyApiTokenList policyApiTokens={policyApiTokens} onDelete={onDelete} />
}

export function PolicyApiTokenListSkeleton() {
  return (
    <>
      {[0, 1].map((index) => (
        <div key={index} className="flex items-center justify-between border-b border-neutral p-4 last:border-0">
          <div className="space-y-2">
            <Skeleton width={200} height={12} show={true} />
            <Skeleton width={260} height={12} show={true} />
          </div>
          <Skeleton width={32} height={32} show={true} />
        </div>
      ))}
    </>
  )
}
