import { useNavigate, useParams } from '@tanstack/react-router'
import { type OrganizationPolicyApiToken } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { PolicyApiTokenCrudModal, PolicyApiTokenPolicyModal } from '@qovery/domains/organizations/feature'
import {
  Badge,
  Button,
  DropdownMenu,
  EmptyState,
  ExternalLink,
  Icon,
  Link,
  Skeleton,
  TablePrimitives,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { dateFullFormat, timeAgo } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { tokenActor } from '../agent-activity/activity-search'
import { useAgentActivity } from '../hooks/use-agent-activity/use-agent-activity'
import { useAgentExperiencePolicyTokens } from '../hooks/use-agent-experience-policy-tokens/use-agent-experience-policy-tokens'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { useDeleteAgentPolicyToken } from '../hooks/use-delete-agent-policy-token/use-delete-agent-policy-token'
import { LoadError } from '../load-error/load-error'
import { fillTimeline, policyTokenName } from '../utils/agent-activity'
import { ActorChip, AgentExperiencePage } from './ui/agent-experience-ui'

const { Table } = TablePrimitives

export const POLICY_TOKENS_EXPLANATION =
  'Give each agent a token that can only do what its policy allows. A denied call never runs.'

/** Opens the existing create form (the token is shown once, at the end). */
function CreatePolicyTokenButton({
  organizationId,
  secondary = false,
}: {
  organizationId: string
  secondary?: boolean
}) {
  const { openModal, closeModal } = useModal()
  return (
    <Button
      type="button"
      size="md"
      variant={secondary ? 'outline' : 'solid'}
      color={secondary ? 'neutral' : 'brand'}
      className="gap-1.5"
      onClick={() =>
        openModal({ content: <PolicyApiTokenCrudModal organizationId={organizationId} onClose={closeModal} /> })
      }
    >
      <Icon iconName="circle-plus" iconStyle="regular" />
      Create policy token
    </Button>
  )
}

const DAY_MS = 24 * 3_600_000

/**
 * One token's last 7 days: a bar per day (allowed in brand, denied in red on top), with the totals.
 * q-core sends only the days with calls: the quiet ones are filled with zero.
 */
function TokenUsage({
  actions,
  denials,
  timeline,
}: {
  actions: number
  denials: number
  timeline: { start: string; actions: number; denials: number }[]
}) {
  if (actions + denials === 0) return <span className="text-neutral-subtle">No calls</span>
  const peak = Math.max(...timeline.map((day) => day.actions + day.denials), 1)
  return (
    <span className="flex items-center gap-3" data-testid="token-usage">
      <span className="flex h-6 items-end gap-0.5" aria-hidden="true">
        {timeline.map((day) => (
          <span
            key={day.start}
            className="flex w-1.5 flex-col-reverse overflow-hidden rounded-sm bg-surface-neutral-component"
            style={{ height: '100%' }}
          >
            <span className="bg-surface-brand-solid" style={{ height: `${(day.actions / peak) * 100}%` }} />
            <span className="bg-surface-negative-solid" style={{ height: `${(day.denials / peak) * 100}%` }} />
          </span>
        ))}
      </span>
      <span className="text-xs tabular-nums">
        <span className="text-neutral">{actions} allowed</span>
        {denials > 0 && <span className="text-negative">, {denials} denied</span>}
      </span>
    </span>
  )
}

/** The organization's policy tokens, surfaced next to the rest of the agent setup. Owners and admins. */
/** Row actions, as in the skill presets list: see its activity, view its policy, delete it. */
function TokenMenu({ token, organizationId }: { token: OrganizationPolicyApiToken; organizationId: string }) {
  const navigate = useNavigate()
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { mutateAsync: deleteToken } = useDeleteAgentPolicyToken({ organizationId })
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button size="md" variant="outline" color="neutral" iconOnly aria-label={`Actions for ${token.name}`}>
          <Icon iconName="ellipsis-v" iconStyle="regular" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Item
          icon={<Icon iconName="wave-pulse" iconStyle="regular" />}
          onSelect={() =>
            navigate({
              to: '/organization/$organizationId/agent-experience/agent-activity',
              params: { organizationId },
              search: { actor: tokenActor(token.id) },
            })
          }
        >
          See activity
        </DropdownMenu.Item>
        <DropdownMenu.Item
          icon={<Icon iconName="file-code" iconStyle="regular" />}
          onSelect={() =>
            // A policy cannot be edited: it is shown read-only, and a change means a new token.
            openModal({
              content: <PolicyApiTokenPolicyModal token={token} onClose={closeModal} />,
              options: { width: 680 },
            })
          }
        >
          View policy
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          color="red"
          icon={<Icon iconName="trash-can" iconStyle="regular" />}
          onSelect={() =>
            openModalConfirmation({
              title: 'Delete policy token',
              // Same confirmation as deleting a skill preset: type the name.
              confirmationMethod: 'name',
              name: token.name,
              action: async () => {
                await deleteToken(token.id)
              },
            })
          }
        >
          Delete token
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

/**
 * The organization's policy tokens, fully managed here: create, see activity, view the policy, delete.
 * Owners and admins.
 */
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
  const to = useMemo(() => new Date(Math.ceil(Date.now() / 60_000) * 60_000), [])
  // Last 7 days of every token, from Activity's by-token breakdown.
  const { data: week } = useAgentActivity({
    organizationId,
    scope: 'organization',
    enabled: canManage,
    from: new Date(to.getTime() - 7 * DAY_MS).toISOString(),
    to: to.toISOString(),
    bucket: 'DAY',
    actorKind: 'POLICY_TOKEN',
  })
  // Deleted tokens are not in the list, but their calls stay in the audit log.
  const { data: month } = useAgentActivity({
    organizationId,
    scope: 'organization',
    enabled: canManage,
    from: new Date(to.getTime() - 30 * DAY_MS).toISOString(),
    to: to.toISOString(),
    bucket: 'DAY',
    actorKind: 'POLICY_TOKEN',
  })
  const usageById = new Map((week?.by_policy_token ?? []).map((row) => [row.policy_token_id, row]))
  const deletedWithActivity = (month?.by_policy_token ?? []).filter(
    (row): row is typeof row & { policy_token_id: string } => row.deleted && Boolean(row.policy_token_id)
  )
  const weekRange = {
    from: new Date(to.getTime() - 7 * DAY_MS).toISOString(),
    to: to.toISOString(),
    bucket: 'DAY' as const,
  }
  useDocumentTitle('Policy tokens - Agents')

  return (
    <AgentExperiencePage
      title="Policy tokens"
      description={
        <>
          {POLICY_TOKENS_EXPLANATION}{' '}
          <ExternalLink href="https://www.qovery.com/docs/configuration/organization/api-policy-token" size="sm">
            How policy tokens work
          </ExternalLink>
        </>
      }
      action={canManage && <CreatePolicyTokenButton organizationId={organizationId} />}
    >
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
          <span className="flex items-center gap-2">
            <CreatePolicyTokenButton organizationId={organizationId} secondary />
            <Link
              as="button"
              to="/organization/$organizationId/agent-experience/automate"
              params={{ organizationId }}
              size="md"
              variant="outline"
              color="neutral"
            >
              Start from a job
            </Link>
          </span>
        </EmptyState>
      ) : (
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Last 7 days</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Last used</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Expires</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>
                <span className="sr-only">Actions</span>
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {tokens.map((token) => {
              const usage = usageById.get(token.id)
              return (
                <Table.Row key={token.id} data-testid={`policy-token-${token.name}`}>
                  <Table.Cell className="h-auto py-2">
                    <span className="flex flex-col">
                      <span className="font-medium text-neutral">
                        <ActorChip kind="policy-token" name={token.name ?? ''} prefix={false} />
                      </span>
                      {token.description && <span className="text-xs text-neutral-subtle">{token.description}</span>}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="capitalize">{token.role_name ?? 'None'}</Table.Cell>
                  <Table.Cell className="h-auto py-2">
                    <TokenUsage
                      actions={usage?.actions ?? 0}
                      denials={usage?.denials ?? 0}
                      timeline={fillTimeline(usage?.timeline ?? [], weekRange, (start) => ({
                        start,
                        actions: 0,
                        denials: 0,
                      }))}
                    />
                  </Table.Cell>
                  <Table.Cell className="text-neutral-subtle">
                    {token.last_used_at ? (
                      <time dateTime={token.last_used_at} title={dateFullFormat(token.last_used_at)}>
                        {timeAgo(new Date(token.last_used_at))} ago
                      </time>
                    ) : (
                      'Never'
                    )}
                  </Table.Cell>
                  <Table.Cell className="text-neutral-subtle">
                    {token.expires_at ? (
                      dateFullFormat(token.expires_at, undefined, 'dd MMM yyyy')
                    ) : (
                      // A token that never expires stays valid if it leaks: flag it.
                      <Badge variant="surface" color="yellow" className="gap-1" data-testid="no-expiry">
                        <Icon iconName="triangle-exclamation" iconStyle="regular" aria-hidden="true" />
                        No expiry
                      </Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <TokenMenu token={token} organizationId={organizationId} />
                  </Table.Cell>
                </Table.Row>
              )
            })}
            {deletedWithActivity.map((row) => (
              // Deleted tokens keep their history: greyed, with the Deleted badge, still linked to Activity.
              <Table.Row
                key={row.policy_token_id}
                className="opacity-70"
                data-testid={`deleted-token-${row.token_name}`}
              >
                <Table.Cell>
                  <ActorChip kind="policy-token" name={policyTokenName(row)} prefix={false} deleted />
                </Table.Cell>
                <Table.Cell className="capitalize text-neutral-subtle">{row.role_name ?? 'None'}</Table.Cell>
                <Table.Cell className="text-xs text-neutral-subtle">Calls in the last 30 days</Table.Cell>
                <Table.Cell className="text-neutral-subtle">
                  <time dateTime={row.last_activity_at} title={dateFullFormat(row.last_activity_at)}>
                    {timeAgo(new Date(row.last_activity_at))} ago
                  </time>
                </Table.Cell>
                <Table.Cell className="text-neutral-subtle">Deleted</Table.Cell>
                <Table.Cell className="text-right">
                  <Link
                    to="/organization/$organizationId/agent-experience/agent-activity"
                    params={{ organizationId }}
                    search={{ actor: tokenActor(row.policy_token_id) }}
                    color="brand"
                    size="sm"
                    aria-label={`See the activity of ${policyTokenName(row)}`}
                  >
                    See activity
                  </Link>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </AgentExperiencePage>
  )
}
