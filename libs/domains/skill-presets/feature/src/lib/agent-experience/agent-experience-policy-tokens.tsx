import { useParams } from '@tanstack/react-router'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { EmptyState, ExternalLink, Icon, Link, Section, Skeleton, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { dateFullFormat, timeAgo } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useAgentExperiencePolicyTokens } from '../hooks/use-agent-experience-policy-tokens/use-agent-experience-policy-tokens'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { LoadError } from '../load-error/load-error'
import { MockScenarioBanner } from '../mock-scenario-banner/mock-scenario-banner'

const { Table } = TablePrimitives

export const POLICY_TOKENS_EXPLANATION =
  'Give each agent a token that can only do what its policy allows. A denied call never runs.'

function CreatePolicyTokenLink({ organizationId }: { organizationId: string }) {
  // Creation and management stay on the existing settings page, which has the form and the policy editor.
  return (
    <Link
      as="button"
      to="/organization/$organizationId/settings/policy-api-token"
      params={{ organizationId }}
      size="md"
      className="gap-1.5"
    >
      <Icon iconName="circle-plus" iconStyle="regular" />
      Create policy token
    </Link>
  )
}

/** The organization's policy tokens, surfaced next to the rest of the agent setup. Owners and admins. */
export function AgentExperiencePolicyTokens() {
  const { organizationId = '' } = useParams({ strict: false })
  const { canManage, isLoading: isRoleLoading } = useCanManageSkillPresets({ organizationId })
  const {
    data: tokens,
    isLoading,
    error,
    refetch,
  } = useAgentExperiencePolicyTokens({
    organizationId,
    enabled: canManage,
  })
  useDocumentTitle('Policy tokens - Agent Experience')

  return (
    <Section className="px-8 pb-8 pt-6">
      <SettingsHeading
        title="Policy tokens"
        description={
          <>
            {POLICY_TOKENS_EXPLANATION}{' '}
            <ExternalLink href="https://www.qovery.com/docs/configuration/organization/api-policy-token" size="sm">
              How policy tokens work
            </ExternalLink>
          </>
        }
      >
        {canManage && <CreatePolicyTokenLink organizationId={organizationId} />}
      </SettingsHeading>
      <div className="flex max-w-content-with-navigation-left flex-col gap-4">
        <MockScenarioBanner />
        {isRoleLoading ? (
          <Skeleton height={120} className="w-full" show />
        ) : !canManage ? (
          <EmptyState
            icon="key"
            title="Only owners and admins manage policy tokens"
            description="Ask one of them for a token for your agent."
          />
        ) : isLoading ? (
          <div aria-busy="true" aria-label="Loading policy tokens">
            <Skeleton height={120} className="w-full" show />
          </div>
        ) : error ? (
          <LoadError title="Policy tokens could not be loaded" error={error} onRetry={() => refetch()} />
        ) : !tokens || tokens.length === 0 ? (
          <EmptyState
            icon="key"
            title="No policy token yet"
            description="Create one per agent or pipeline, with a policy that says what it may do."
          >
            <CreatePolicyTokenLink organizationId={organizationId} />
          </EmptyState>
        ) : (
          <>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Last used</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Expires</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {tokens.map((token) => (
                  <Table.Row key={token.id}>
                    <Table.Cell className="h-auto py-2">
                      <span className="flex flex-col">
                        <span className="inline-flex items-center gap-1.5 font-medium text-neutral">
                          <Icon iconName="key" iconStyle="regular" className="text-neutral-subtle" aria-hidden="true" />
                          {token.name}
                        </span>
                        {token.description && <span className="text-xs text-neutral-subtle">{token.description}</span>}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="capitalize">{token.role_name ?? 'None'}</Table.Cell>
                    <Table.Cell className="text-neutral-subtle">
                      {token.last_used_at ? (
                        <Tooltip content={dateFullFormat(token.last_used_at)}>
                          <span tabIndex={0}>{timeAgo(new Date(token.last_used_at))} ago</span>
                        </Tooltip>
                      ) : (
                        'Never'
                      )}
                    </Table.Cell>
                    <Table.Cell className="text-neutral-subtle">
                      {token.expires_at ? dateFullFormat(token.expires_at, undefined, 'dd MMM yyyy') : 'Never'}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
            <p className="text-sm text-neutral-subtle">
              To edit a policy or delete a token, go to{' '}
              <Link
                to="/organization/$organizationId/settings/policy-api-token"
                params={{ organizationId }}
                color="brand"
                size="sm"
              >
                policy token settings
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </Section>
  )
}
