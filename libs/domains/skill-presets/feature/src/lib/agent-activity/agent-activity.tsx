import { Link, useParams } from '@tanstack/react-router'
import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import clsx from 'clsx'
import { type ReactNode, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { match } from 'ts-pattern'
import {
  AGENT_ACTIVITY_TIMED_OUT_MESSAGE,
  getSkillPresetErrorStatus,
  isAgentActivityTimedOut,
} from '@qovery/domains/skill-presets/data-access'
import {
  Badge,
  Button,
  Callout,
  Chart,
  EmptyState,
  Heading,
  Icon,
  InputSelectSmall,
  Navbar,
  Pagination,
  Section,
  Skeleton,
  TableFilter,
  TablePrimitives,
  TabsPrimitives,
  Tooltip,
} from '@qovery/shared/ui'
import { dateFullFormat, timeAgo } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import {
  ActorChip,
  AgentExperiencePage,
  OutcomeBadge,
  Stat,
  StatGrid,
} from '../agent-experience/ui/agent-experience-ui'
import { useAgentActivity } from '../hooks/use-agent-activity/use-agent-activity'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { LoadError } from '../load-error/load-error'
import {
  type AgentActivityHint,
  LEGACY_TOKEN_LABEL,
  actionLabel,
  actorLabel,
  computeAgentActivityHints,
  fillTimeline,
  memberCount,
  peopleRows,
  policyTokenName,
  targetLabel,
  unusedSkills,
} from '../utils/agent-activity'
import {
  ACTIVITY_RANGES,
  type ActivityScope,
  type ActivitySearch,
  DEFAULT_RANGE,
  SOURCE_FILTER_LABELS,
  activityParams,
  activityRange,
  activityWindowEnd,
  hasActivityFilters,
  memberActor,
  parseActor,
  tokenActor,
} from './activity-search'
import { type AgentActivityBucket, type AgentActivityResponse, type AgentActorType } from './agent-activity.types'
import { useActivitySearch } from './use-activity-search'

const { Table } = TablePrimitives
const { Tabs } = TabsPrimitives

const actionColumns: ColumnDef<AgentActivityResponse['recent'][number]>[] = [
  {
    id: 'action',
    header: 'Action',
    accessorFn: ({ event, target_type }) => actionLabel(event, target_type),
    filterFn: (row, id, values: string[]) => !values?.length || values.includes(row.getValue(id)),
  },
]

const ALL = 'all'
const ATTRIBUTION_NOTE =
  'Actions are matched to people by username and to skills by the agent’s user agent; treat them as indicative.'
const NO_SKILL_LABEL = 'No skill (MCP or API)'

type Breakdown = NonNullable<ActivitySearch['view']>

/** A name that narrows the whole page to it. Pressed when that filter is active. */
function DrillButton({
  children,
  active,
  onClick,
  label,
}: {
  children: ReactNode
  active: boolean
  onClick: () => void
  label?: string
}) {
  return (
    <Button
      type="button"
      variant="plain"
      color="neutral"
      size="xs"
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      className="h-auto cursor-pointer px-0 text-left text-sm font-normal underline-offset-2 hover:underline"
    >
      {children}
    </Button>
  )
}

/**
 * A member's name, or "Policy token <name>" with a key. The kind comes from q-core when it says it;
 * an older token record with no name reads "Unknown policy token (older records)".
 */
function Actor({ userName, kind }: { userName: string; kind?: AgentActorType }) {
  const parsed = actorLabel(userName)
  if (kind === 'POLICY_TOKEN' && parsed.kind !== 'policy-token') {
    return <ActorChip kind="policy-token" name={LEGACY_TOKEN_LABEL} prefix={false} />
  }
  return (
    <ActorChip
      kind={parsed.kind}
      name={parsed.kind === 'policy-token' ? parsed.label.replace(/^Policy token /, '') : parsed.label}
    />
  )
}

function SkillName({ name }: { name: string | null }) {
  return name ? <span className="font-sans">{name}</span> : <span className="text-neutral-subtle">No skill</span>
}

function DeniedCount({ value }: { value: number }) {
  return value > 0 ? (
    <span className="inline-flex items-center gap-1 text-negative">
      <Icon iconName="ban" iconStyle="regular" aria-hidden="true" />
      {value}
    </span>
  ) : (
    <>0</>
  )
}

const suggestionCardClassName =
  'flex w-full cursor-pointer flex-col gap-1 rounded-md border border-neutral bg-surface-neutral p-3 text-left text-sm font-normal transition-colors hover:border-neutral-component hover:bg-surface-neutral-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-strong'

export function HintLine({
  hint,
  organizationId,
  onShowMember,
  onShowToken,
}: {
  hint: AgentActivityHint
  organizationId: string
  onShowMember: (userSub: string) => void
  onShowToken?: (tokenId: string) => void
}) {
  const card = match(hint)
    .returnType<{ title: string; description: string; destination: 'presets' | 'policies'; onClick?: () => void }>()
    .with({ kind: 'unused-skills' }, (hint) => ({
      title: `${hint.skills.length} Qovery ${hint.skills.length === 1 ? 'skill was' : 'skills were'} not used`,
      description: `${hint.skills.join(', ')}. Consider turning them off in a preset.`,
      destination: 'presets' as const,
    }))
    .with({ kind: 'environment-denials' }, (hint) => ({
      title: `${hint.count} recent actions denied in ${hint.environment}`,
      description: 'Review the policy tokens used for this environment.',
      destination: 'policies' as const,
    }))
    .with({ kind: 'member-denials' }, (hint) => ({
      title: `${hint.count} actions denied for ${hint.userName}`,
      description: 'Review their activity to understand what was blocked.',
      destination: 'policies' as const,
      onClick: hint.userSub ? () => hint.userSub && onShowMember(hint.userSub) : undefined,
    }))
    .with({ kind: 'token-denials' }, (hint) => ({
      title: `${hint.count} calls denied for ${hint.tokenName}${hint.deleted ? ' (deleted)' : ''}`,
      description: 'Review the calls blocked by this token’s policy.',
      destination: 'policies' as const,
      onClick: onShowToken && hint.tokenId ? () => hint.tokenId && onShowToken(hint.tokenId) : undefined,
    }))
    .with({ kind: 'loads-without-actions' }, (hint) => ({
      title: `${hint.skillName}: ${hint.loads} loads without a Qovery action`,
      description: 'A skill load does not always lead to an API action. Check its purpose before changing the preset.',
      destination: 'presets' as const,
    }))
    .exhaustive()
  const content = (
    <>
      <span className="text-neutral">{card.title}</span>
      <span className="text-ssm text-neutral-subtle">{card.description}</span>
    </>
  )
  if (card.onClick) {
    return (
      <button type="button" className={suggestionCardClassName} onClick={card.onClick}>
        {content}
      </button>
    )
  }
  return (
    <Link
      to={
        card.destination === 'presets'
          ? '/organization/$organizationId/agent-experience/skill-presets'
          : '/organization/$organizationId/agent-experience/policy-tokens'
      }
      params={{ organizationId }}
      className={suggestionCardClassName}
    >
      {content}
    </Link>
  )
}

function FilterBar({
  search,
  setSearch,
  scope,
  lists,
}: {
  search: ActivitySearch
  setSearch: (patch: Partial<ActivitySearch>) => void
  scope: ActivityScope
  lists?: AgentActivityResponse
}) {
  const actorOptions = [
    { value: ALL, label: 'All actors' },
    { value: 'members', label: 'All members' },
    { value: 'tokens', label: 'All policy tokens' },
    ...(lists ? peopleRows(lists) : []).flatMap(({ user_sub, user_name }) =>
      user_sub ? [{ value: memberActor(user_sub), label: user_name }] : []
    ),
    // Deleted tokens stay filterable; older records with no token id cannot be.
    ...(lists?.by_policy_token ?? []).flatMap((row) =>
      row.policy_token_id
        ? [
            {
              value: tokenActor(row.policy_token_id),
              label: `Policy token ${policyTokenName(row)}${row.deleted ? ' (deleted)' : ''}`,
            },
          ]
        : []
    ),
  ]
  // A filter change starts the recent actions back on their first page.
  const set = (patch: Partial<ActivitySearch>) => setSearch({ ...patch, page: undefined })
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-testid="activity-filters"
      role="toolbar"
      aria-label="Filters"
    >
      {scope === 'organization' && (
        <InputSelectSmall
          inputClassName="h-8"
          className="w-48 shrink-0"
          name="actor"
          ariaLabel="Actor"
          defaultValue={search.actor ?? ALL}
          onChange={(value) => set({ actor: value === ALL ? undefined : (value as string) })}
          items={actorOptions}
        />
      )}
      <InputSelectSmall
        inputClassName="h-8"
        className="w-48 shrink-0"
        name="skill"
        ariaLabel="Skill"
        defaultValue={search.skill ?? ALL}
        onChange={(value) => set({ skill: value === ALL ? undefined : (value as string) })}
        items={[
          { value: ALL, label: 'All skills' },
          ...(lists?.by_skill ?? []).flatMap(({ skill_name }) =>
            skill_name ? [{ value: skill_name, label: skill_name }] : []
          ),
        ]}
      />
      <InputSelectSmall
        inputClassName="h-8"
        className="w-48 shrink-0"
        name="source"
        ariaLabel="Source"
        defaultValue={search.via ?? ALL}
        onChange={(value) => set({ via: value === ALL ? undefined : (value as ActivitySearch['via']) })}
        items={[
          { value: ALL, label: 'All sources' },
          ...Object.entries(SOURCE_FILTER_LABELS).map(([value, label]) => ({ value, label })),
        ]}
      />
      <InputSelectSmall
        inputClassName="h-8"
        className="w-48 shrink-0"
        name="outcome"
        ariaLabel="Authorization"
        defaultValue={search.outcome ?? ALL}
        onChange={(value) => set({ outcome: value === ALL ? undefined : (value as ActivitySearch['outcome']) })}
        items={[
          { value: ALL, label: 'All authorizations' },
          { value: 'ALLOWED', label: 'Allowed' },
          { value: 'DENIED', label: 'Denied' },
        ]}
      />
      {hasActivityFilters(search, scope) && (
        <Button
          type="button"
          size="sm"
          variant="plain"
          color="neutral"
          onClick={() => set({ actor: undefined, skill: undefined, outcome: undefined, via: undefined })}
        >
          Clear filters
        </Button>
      )}
      <InputSelectSmall
        name="time-range"
        ariaLabel="Period"
        className="ml-auto w-[180px] shrink-0"
        inputClassName="h-8"
        items={ACTIVITY_RANGES.map(({ value, label }) => ({ value, label: `Last ${label}` }))}
        defaultValue={search.range ?? DEFAULT_RANGE}
        onChange={(value) => setSearch({ range: value === DEFAULT_RANGE ? undefined : value, page: undefined })}
      />
    </div>
  )
}

function BreakdownTable({
  activity,
  scope,
  search,
  setSearch,
}: {
  activity: AgentActivityResponse
  scope: ActivityScope
  search: ActivitySearch
  setSearch: (patch: Partial<ActivitySearch>) => void
}) {
  const { organizationId = '' } = useParams({ strict: false })
  const isOrganization = scope === 'organization'
  // Follows the actor filter (tokens show by token) until someone picks another breakdown.
  const actor = parseActor(search.actor)
  const automatic: Breakdown = !isOrganization
    ? 'skill'
    : actor.policyTokenId || actor.actorKind === 'POLICY_TOKEN'
      ? 'token'
      : 'member'
  // The chosen breakdown is in the URL (`view`), so a shared link keeps it.
  const breakdown: Breakdown = isOrganization ? search.view ?? automatic : 'skill'
  const setBreakdown = (view: Breakdown) => setSearch({ view: view === automatic ? undefined : view })
  const toggle = (key: 'actor' | 'skill', value: string) =>
    setSearch({ [key]: search[key] === value ? undefined : value, page: undefined })
  const unused = unusedSkills(activity)
  const tokens = activity.by_policy_token ?? []
  const people = peopleRows(activity)

  return (
    <Section aria-labelledby="activity-breakdown" className="flex min-w-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral p-3">
        <div className="flex items-center gap-2">
          <Heading level={2} id="activity-breakdown" className="text-sm font-medium">
            Breakdown
          </Heading>
          <Tooltip content={ATTRIBUTION_NOTE}>
            <span tabIndex={0} aria-label="About activity attribution">
              <Icon iconName="circle-info" iconStyle="regular" className="text-neutral-subtle" />
            </span>
          </Tooltip>
        </div>
        {isOrganization && (
          <InputSelectSmall
            name="breakdown"
            ariaLabel="Breakdown"
            className="w-[180px]"
            inputClassName="h-8"
            defaultValue={breakdown}
            onChange={(value) => setBreakdown(value as Breakdown)}
            items={[
              { value: 'member', label: 'By member' },
              { value: 'token', label: 'By token' },
              { value: 'skill', label: 'By skill' },
            ]}
          />
        )}
      </div>
      <Table.Root
        data-testid={`breakdown-${breakdown}`}
        className="w-full min-w-[960px]"
        containerClassName="rounded-none border-0 overflow-x-auto"
      >
        {breakdown === 'member' && (
          <>
            <Table.Header className="[&_th]:text-xs">
              <Table.Row>
                <Table.ColumnHeaderCell>Member</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Skill loads</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Allowed</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Denied</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Top skills</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Last activity</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {people.length === 0 && (
                <Table.Row>
                  <Table.Cell colSpan={6} className="text-neutral-subtle">
                    No member acted with these filters.
                  </Table.Cell>
                </Table.Row>
              )}
              {people.map((row) => (
                <Table.Row key={row.user_sub ?? row.user_name}>
                  <Table.Cell>
                    {row.user_sub ? (
                      <DrillButton
                        active={search.actor === memberActor(row.user_sub)}
                        onClick={() => row.user_sub && toggle('actor', memberActor(row.user_sub))}
                        label={row.user_name}
                      >
                        <ActorChip kind="member" name={row.user_name} />
                      </DrillButton>
                    ) : (
                      <Actor userName={row.user_name} />
                    )}
                  </Table.Cell>
                  <Table.Cell className="tabular-nums">{row.skill_loads}</Table.Cell>
                  <Table.Cell className="tabular-nums">{row.actions}</Table.Cell>
                  <Table.Cell className="tabular-nums">
                    <DeniedCount value={row.denials} />
                  </Table.Cell>
                  <Table.Cell className="h-auto py-3">
                    <span className="flex flex-wrap gap-1">
                      {row.top_skills.length === 0 && <span className="text-neutral-subtle">None</span>}
                      {row.top_skills.map((skill) => (
                        <Badge key={skill} variant="surface" size="base" className="font-medium">
                          {skill}
                        </Badge>
                      ))}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="text-neutral-subtle">{timeAgo(new Date(row.last_activity_at))} ago</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </>
        )}
        {breakdown === 'token' && (
          <>
            <Table.Header className="[&_th]:text-xs">
              <Table.Row>
                <Table.ColumnHeaderCell>Policy token</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Allowed</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Denied</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Most frequent</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Last activity</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {tokens.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={5} className="text-neutral-subtle">
                    No policy token acted in this period.{' '}
                    <Link
                      to="/organization/$organizationId/agent-experience/policy-tokens"
                      params={{ organizationId }}
                      className="font-medium text-brand hover:underline"
                    >
                      Policy tokens
                    </Link>
                  </Table.Cell>
                </Table.Row>
              ) : (
                tokens.map((row) => (
                  <Table.Row key={row.policy_token_id ?? 'older-records'}>
                    <Table.Cell>
                      {row.policy_token_id ? (
                        <DrillButton
                          active={search.actor === tokenActor(row.policy_token_id)}
                          onClick={() => row.policy_token_id && toggle('actor', tokenActor(row.policy_token_id))}
                          label={`Policy token ${policyTokenName(row)}`}
                        >
                          <ActorChip kind="policy-token" name={policyTokenName(row)} deleted={row.deleted} />
                        </DrillButton>
                      ) : (
                        <span className="text-sm text-neutral-subtle">
                          <ActorChip kind="policy-token" name={policyTokenName(row)} prefix={false} />
                        </span>
                      )}
                    </Table.Cell>
                    <Table.Cell className="tabular-nums">{row.actions}</Table.Cell>
                    <Table.Cell className="tabular-nums">
                      <DeniedCount value={row.denials} />
                    </Table.Cell>
                    <Table.Cell className="h-auto py-3 text-sm text-neutral-subtle">
                      {row.top_actions
                        .map(({ event, target_type, count }) => `${actionLabel(event, target_type)} (${count})`)
                        .join(', ')}
                    </Table.Cell>
                    <Table.Cell className="text-neutral-subtle">
                      {timeAgo(new Date(row.last_activity_at))} ago
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </>
        )}
        {breakdown === 'skill' && (
          <>
            <Table.Header className="[&_th]:text-xs">
              <Table.Row>
                <Table.ColumnHeaderCell>Skill</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Loads</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Allowed</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Denied</Table.ColumnHeaderCell>
                {isOrganization && <Table.ColumnHeaderCell>Members</Table.ColumnHeaderCell>}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {activity.by_skill.length === 0 && (
                <Table.Row>
                  <Table.Cell colSpan={5} className="text-neutral-subtle">
                    No skill with these filters.
                  </Table.Cell>
                </Table.Row>
              )}
              {activity.by_skill.map(({ skill_name: name, ...row }) => (
                <Table.Row key={name ?? NO_SKILL_LABEL}>
                  <Table.Cell>
                    {name ? (
                      <DrillButton active={search.skill === name} onClick={() => toggle('skill', name)}>
                        {name}
                      </DrillButton>
                    ) : (
                      NO_SKILL_LABEL
                    )}
                  </Table.Cell>
                  <Table.Cell className="tabular-nums">{row.loads}</Table.Cell>
                  <Table.Cell className="tabular-nums">{row.actions}</Table.Cell>
                  <Table.Cell className="tabular-nums">
                    <DeniedCount value={row.denials} />
                  </Table.Cell>
                  {isOrganization && <Table.Cell className="tabular-nums">{row.members}</Table.Cell>}
                </Table.Row>
              ))}
            </Table.Body>
          </>
        )}
      </Table.Root>
      {breakdown === 'skill' && isOrganization && !hasActivityFilters(search, scope) && unused.length > 0 && (
        <p className="border-t border-neutral p-3 text-xs text-neutral-subtle" data-testid="never-loaded">
          Never loaded in this period: <span className="font-sans">{unused.join(', ')}</span>. Consider turning them off
          in the preset.{' '}
          <Link
            to="/organization/$organizationId/agent-experience/skill-presets"
            params={{ organizationId }}
            className="font-medium text-brand hover:underline"
          >
            Open the Skills registry
          </Link>
        </p>
      )}
    </Section>
  )
}

const PAGE_SIZE_DEFAULT = 10

/** "197 allowed, 14 denied, busiest day 25 Oct with 12": the chart, for screen readers. */
function chartSummary(points: { label: string; allowed: number; denied: number }[]) {
  const allowed = points.reduce((total, point) => total + point.allowed, 0)
  const denied = points.reduce((total, point) => total + point.denied, 0)
  const peak = points.reduce(
    (best, point) =>
      point.allowed + point.denied > best.count ? { label: point.label, count: point.allowed + point.denied } : best,
    { label: '', count: 0 }
  )
  return `${allowed} allowed and ${denied} denied actions${peak.count > 0 ? `, busiest ${peak.label} with ${peak.count}` : ''}.`
}

function ActivityContent({
  activity,
  previous,
  scope,
  organizationId,
  search,
  setSearch,
  bucket,
}: {
  activity: AgentActivityResponse
  previous?: AgentActivityResponse
  scope: ActivityScope
  organizationId: string
  search: ActivitySearch
  setSearch: (patch: Partial<ActivitySearch>) => void
  bucket: AgentActivityBucket
}) {
  const isOrganization = scope === 'organization'
  const filtered = hasActivityFilters(search, scope)
  const [tableView, setTableView] = useState(search.view ? 'breakdown' : 'recent')
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT)
  const [actionFilters, setActionFilters] = useState<ColumnFiltersState>([])
  const hints = useMemo(
    () =>
      isOrganization
        ? computeAgentActivityHints(activity, { filtered, source: search.via, outcome: search.outcome })
            .sort((a, b) => {
              const priority = (hint: AgentActivityHint) =>
                match(hint)
                  .with({ kind: 'environment-denials' }, { kind: 'member-denials' }, { kind: 'token-denials' }, () => 0)
                  .with({ kind: 'unused-skills' }, () => 1)
                  .with({ kind: 'loads-without-actions' }, () => 2)
                  .exhaustive()
              return priority(a) - priority(b) || ('count' in b ? b.count : 0) - ('count' in a ? a.count : 0)
            })
            .slice(0, 3)
        : [],
    [activity, isOrganization, filtered, search.via, search.outcome]
  )
  const timeline = fillTimeline(activity.timeline, activity, (start) => ({
    start,
    skill_loads: 0,
    actions: 0,
    denials: 0,
  })).map((point) => ({
    label: dateFullFormat(point.start, undefined, bucket === 'HOUR' ? 'HH:mm' : 'dd MMM'),
    fullTime: dateFullFormat(point.start),
    // q-core counts allowed actions in `actions` and refused ones in `denials`.
    allowed: point.actions,
    denied: point.denials,
  }))
  const denied = activity.recent.filter(({ outcome }) => outcome === 'DENIED')
  const actorFilter = parseActor(search.actor)
  const tokensOnly = isOrganization && Boolean(actorFilter.policyTokenId || actorFilter.actorKind === 'POLICY_TOKEN')
  const delta = (current: number, before?: number) => (before === undefined ? undefined : current - before)

  const actionTable = useReactTable({
    data: activity.recent,
    columns: actionColumns,
    state: { columnFilters: actionFilters },
    onColumnFiltersChange: (updater) => {
      setActionFilters(updater)
      setSearch({ page: undefined })
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })
  const actionColumn = actionTable.getColumn('action')
  const rows = actionTable.getRowModel().rows.map(({ original }) => original)
  const pageCount = Math.max(Math.ceil(rows.length / pageSize), 1)
  const page = Math.min(search.page ?? 1, pageCount)
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)

  if (activity.totals.skill_loads + activity.totals.actions + activity.totals.denials === 0) {
    return (
      <EmptyState
        icon="wave-pulse"
        title={
          filtered
            ? 'Nothing matches these filters'
            : isOrganization
              ? 'No agent activity yet'
              : 'Your agent has no activity yet'
        }
        description={
          filtered
            ? 'Try another period, or clear the filters.'
            : 'When a coding agent loads a Qovery skill or acts on Qovery through the API, the CLI, MCP or a policy token, it shows here.'
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        {tokensOnly ? (
          // Skill loads and members are people's: they say nothing about policy tokens.
          <StatGrid columns={2}>
            <Stat
              prominent
              label="Allowed actions"
              value={activity.totals.actions}
              delta={delta(activity.totals.actions, previous?.totals.actions)}
            />
            <Stat
              prominent
              label="Denied actions"
              icon="ban"
              value={activity.totals.denials}
              delta={delta(activity.totals.denials, previous?.totals.denials)}
              riseIsBad
            />
          </StatGrid>
        ) : (
          <StatGrid columns={isOrganization ? 4 : 3}>
            <Stat
              prominent
              label="Skill loads"
              value={activity.totals.skill_loads}
              delta={delta(activity.totals.skill_loads, previous?.totals.skill_loads)}
            />
            <Stat
              prominent
              label="Allowed actions"
              value={activity.totals.actions}
              delta={delta(activity.totals.actions, previous?.totals.actions)}
            />
            <Stat
              prominent
              label="Denied actions"
              icon="ban"
              value={activity.totals.denials}
              delta={delta(activity.totals.denials, previous?.totals.denials)}
              riseIsBad
            />
            {isOrganization && (
              <Stat
                prominent
                label="Members with agents"
                value={memberCount(activity)}
                delta={previous ? memberCount(activity) - memberCount(previous) : undefined}
              />
            )}
          </StatGrid>
        )}

        <div className="min-w-0">
          <Section
            aria-labelledby="activity-timeline"
            className="flex flex-col gap-4 rounded-md border border-neutral bg-surface-neutral p-4"
          >
            <div className="flex items-center justify-between">
              <Heading level={2} id="activity-timeline">
                Actions over time
              </Heading>
              <span className="flex items-center gap-4 text-xs text-neutral-subtle" aria-hidden="true">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-3 rounded-sm bg-surface-brand-solid" /> Allowed
                </span>
                <span className="flex items-center gap-1.5">
                  <svg width="12" height="8" aria-hidden="true">
                    <rect width="12" height="8" rx="1" fill="url(#denied-hatch)" />
                  </svg>
                  <Icon iconName="ban" iconStyle="regular" className="text-negative" />
                  Denied
                </span>
              </span>
            </div>
            <p className="sr-only" data-testid="chart-summary">
              {chartSummary(timeline)}
            </p>
            <Chart.Container
              className="h-56"
              isEmpty={activity.totals.actions + activity.totals.denials === 0}
              aria-hidden="true"
            >
              <BarChart data={timeline} margin={{ top: 8, bottom: 0, left: 0, right: 0 }}>
                {/* Denied bars are hatched as well as red, so they read without color too. */}
                <defs>
                  <pattern
                    id="denied-hatch"
                    width="4"
                    height="4"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(45)"
                  >
                    <rect width="4" height="4" fill="var(--negative-9)" />
                    <line x1="0" y1="0" x2="0" y2="4" stroke="var(--negative-11)" strokeWidth="1.5" />
                  </pattern>
                </defs>
                <CartesianGrid horizontal vertical={false} stroke="var(--neutral-4)" />
                <XAxis dataKey="label" tickLine={false} minTickGap={24} />
                <YAxis allowDecimals={false} width={32} tickLine={false} axisLine={false} />
                <Chart.Tooltip
                  content={({ active, payload }) => (
                    <Chart.TooltipContent
                      active={active}
                      payload={payload?.map((entry) => ({
                        dataKey: String(entry.dataKey),
                        value: typeof entry.value === 'number' ? entry.value : String(entry.value ?? ''),
                        color: entry.dataKey === 'denied' ? 'var(--negative-9)' : 'var(--brand-9)',
                        payload: entry.payload,
                      }))}
                      title="Actions"
                      formatLabel={(key) => (key === 'allowed' ? 'Allowed' : 'Denied')}
                    />
                  )}
                />
                <Bar dataKey="allowed" stackId="actions" fill="var(--brand-9)" isAnimationActive={false} />
                <Bar dataKey="denied" stackId="actions" fill="url(#denied-hatch)" isAnimationActive={false} />
              </BarChart>
            </Chart.Container>
          </Section>
        </div>
      </div>

      <Tabs.Root className="min-w-0" value={tableView} onValueChange={setTableView}>
        <div className="overflow-hidden rounded-t-lg border-x border-t border-neutral bg-surface-neutral-subtle">
          <div className="pb-2">
            <Tabs.List asChild className="overflow-visible">
              <Navbar.Root activeId={tableView} ariaLabel="Activity views" className="ml-3">
                <Tabs.Trigger value="recent" asChild className="h-auto border-0 px-3 py-3">
                  <Navbar.Item id="recent">
                    <Icon iconName="list-ul" iconStyle="regular" />
                    Recent actions
                  </Navbar.Item>
                </Tabs.Trigger>
                <Tabs.Trigger value="breakdown" asChild className="h-auto border-0 px-3 py-3">
                  <Navbar.Item id="breakdown">
                    <Icon iconName="chart-simple" iconStyle="regular" />
                    Breakdown
                  </Navbar.Item>
                </Tabs.Trigger>
              </Navbar.Root>
            </Tabs.List>
          </div>
        </div>
        <div className="relative -top-2 rounded-lg bg-background">
          <Tabs.Content value="recent">
            <Section
              aria-labelledby="activity-recent"
              className="min-w-0 overflow-hidden rounded-lg border border-neutral bg-surface-neutral"
            >
              <Heading level={2} id="activity-recent" className="sr-only">
                Recent actions
              </Heading>
              <p className="sr-only" aria-live="polite" data-testid="recent-count">
                {rows.length === 0
                  ? 'No action of this type in this period.'
                  : `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, rows.length)} of ${rows.length} actions in this period.`}
              </p>
              <Table.Root className="w-full min-w-[960px]" containerClassName="rounded-none border-0 overflow-x-auto">
                <Table.Header className="[&_th]:text-xs">
                  <Table.Row>
                    <Table.ColumnHeaderCell>
                      {actionColumn && <TableFilter column={actionColumn} />}
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Resource</Table.ColumnHeaderCell>
                    {isOrganization && <Table.ColumnHeaderCell>Actor</Table.ColumnHeaderCell>}
                    <Table.ColumnHeaderCell>Source</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Authorization</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>When</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {pageRows.map((action) => (
                    <Table.Row
                      key={`${action.at}-${action.user_name}-${action.target_name}`}
                      data-outcome={action.outcome}
                    >
                      <Table.Cell className="font-medium">{actionLabel(action.event, action.target_type)}</Table.Cell>
                      <Table.Cell className="h-auto py-3">
                        <span className="flex flex-col gap-1">
                          <span>{action.target_name}</span>
                          <span className="text-ssm text-neutral-subtle">
                            {targetLabel(action.target_type)}
                            {action.environment_name && action.environment_name !== action.target_name && (
                              <> · Environment: {action.environment_name}</>
                            )}
                          </span>
                        </span>
                      </Table.Cell>
                      {isOrganization && (
                        <Table.Cell>
                          <Actor userName={action.user_name} kind={action.actor_kind} />
                        </Table.Cell>
                      )}
                      <Table.Cell>
                        {action.skill_name ? (
                          <SkillName name={action.skill_name} />
                        ) : (
                          <span className="text-neutral-subtle">
                            {match(action.source)
                              .with('MCP_TOOL_CALL', () => 'MCP')
                              .with('POLICY_TOKEN_API_ACTION', () => 'API')
                              .otherwise(() => 'Not attributed')}
                          </span>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <OutcomeBadge outcome={action.outcome} />
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">
                        <time dateTime={action.at} title={dateFullFormat(action.at)}>
                          {timeAgo(new Date(action.at))} ago
                        </time>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
              {rows.length > pageSize || page > 1 ? (
                <Pagination
                  className="border-t border-neutral bg-surface-neutral p-3"
                  previousDisabled={page <= 1}
                  nextDisabled={page >= pageCount}
                  onPrevious={() => setSearch({ page: page - 1 > 1 ? page - 1 : undefined })}
                  onNext={() => setSearch({ page: page + 1 })}
                  pageSize={String(pageSize)}
                  onPageSizeChange={(size) => {
                    setPageSize(Number(size) || PAGE_SIZE_DEFAULT)
                    setSearch({ page: undefined })
                  }}
                />
              ) : null}
            </Section>
          </Tabs.Content>
          <Tabs.Content
            value="breakdown"
            className="min-w-0 overflow-hidden rounded-lg border border-neutral bg-surface-neutral"
          >
            <BreakdownTable
              activity={activity}
              scope={scope}
              search={search}
              setSearch={(patch) => {
                setSearch(patch)
                if ('actor' in patch || 'skill' in patch) setTableView('recent')
              }}
            />
          </Tabs.Content>
        </div>
      </Tabs.Root>

      <div className="grid items-start gap-4 xl:grid-cols-2">
        {isOrganization && (
          <Section
            aria-labelledby="activity-suggestions"
            className="flex flex-col gap-3 rounded-md border border-neutral bg-surface-neutral-subtle p-3"
          >
            <Heading level={2} id="activity-suggestions" className="text-sm font-normal text-neutral-subtle">
              Suggestions
            </Heading>
            {hints.length === 0 ? (
              <p className="text-sm text-neutral-subtle">Nothing to adjust in this period.</p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm text-neutral" data-testid="activity-suggestions">
                {hints.map((hint) => (
                  <li
                    key={`${hint.kind}-${'environment' in hint ? hint.environment : 'tokenId' in hint ? hint.tokenId : 'userName' in hint ? hint.userName : 'skillName' in hint ? hint.skillName : ''}`}
                  >
                    <HintLine
                      hint={hint}
                      organizationId={organizationId}
                      onShowMember={(userSub) => setSearch({ actor: memberActor(userSub), page: undefined })}
                      onShowToken={(tokenId) => setSearch({ actor: tokenActor(tokenId), page: undefined })}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Section>
        )}
        <Section
          aria-labelledby="activity-denied"
          className="flex flex-col gap-3 overflow-hidden rounded-lg border border-neutral bg-surface-neutral-subtle pt-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 px-4">
            <Heading
              level={2}
              id="activity-denied"
              className="flex items-center gap-1.5 text-sm font-normal text-neutral-subtle"
            >
              <Icon iconName="ban" iconStyle="regular" />
              What was blocked
            </Heading>
            {activity.totals.denials > 0 && search.outcome !== 'DENIED' && (
              <span className="text-xs text-neutral-subtle" data-testid="denied-count">
                <Button
                  type="button"
                  variant="plain"
                  color="brand"
                  size="xs"
                  className="h-auto px-0 text-xs"
                  onClick={() => setSearch({ outcome: 'DENIED', page: undefined })}
                >
                  Show all denied
                </Button>
              </span>
            )}
          </div>
          {denied.length === 0 ? (
            <p className="text-sm text-neutral-subtle" data-testid="no-recent-denial">
              {activity.totals.denials > 0
                ? 'Denied actions in this period are not among the 100 most recent shown.'
                : 'No agent action was denied in this period.'}
            </p>
          ) : (
            <ol className="rounded-t-lg border-t border-neutral bg-surface-neutral py-1.5" data-testid="denied-actions">
              {denied.slice(0, 6).map((action) => (
                <li
                  key={`${action.at}-${action.user_name}-${action.target_name}`}
                  className="relative flex items-center gap-4 px-4 py-1.5 before:absolute before:bottom-0 before:left-[27.5px] before:top-0 before:w-px before:bg-surface-neutral-component first:before:top-1/2 last:before:bottom-1/2"
                >
                  <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-neutral-component text-xs text-neutral-subtle">
                    <Icon iconName="ban" iconStyle="regular" aria-hidden="true" />
                  </span>
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <p className="text-sm text-neutral">
                      Blocked on <span className="font-medium">{action.target_name}</span>
                      {action.environment_name && action.environment_name !== action.target_name && (
                        <> in {action.environment_name}</>
                      )}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-ssm text-neutral-subtle">
                      {isOrganization && <Actor userName={action.user_name} kind={action.actor_kind} />}
                      <span className="inline-flex items-center gap-1">
                        <Icon iconName="calendar-day" iconStyle="regular" aria-hidden="true" />
                        <time dateTime={action.at} title={dateFullFormat(action.at)}>
                          {timeAgo(new Date(action.at))} ago
                        </time>
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Section>
      </div>
    </div>
  )
}

/**
 * Everything agents did on Qovery, in one view: actions of members' agents (through skills and MCP)
 * and of policy tokens, allowed and denied. Owners and admins see the organization; anyone else sees
 * only their own agent, with the same detail. Filters live in the URL.
 */
export function AgentActivity() {
  const { organizationId = '' } = useParams({ strict: false })
  const { canManage, isLoading: isRoleLoading } = useCanManageSkillPresets({ organizationId })
  const scope: ActivityScope = canManage ? 'organization' : 'me'
  const [search, setSearch] = useActivitySearch()
  const range = activityRange(search)
  const to = activityWindowEnd()
  const params = activityParams(search, to, scope)
  const { data, isLoading, isFetching, error, refetch } = useAgentActivity({
    organizationId,
    scope,
    enabled: !isRoleLoading,
    ...params,
  })
  // The filter menus list everyone and every skill of the period, not only the filtered ones.
  const { data: lists } = useAgentActivity({
    organizationId,
    scope,
    enabled: !isRoleLoading,
    from: params.from,
    to: params.to,
    bucket: params.bucket,
  })
  // The same length of time just before, to compare the numbers with.
  const length = new Date(params.to).getTime() - new Date(params.from).getTime()
  const { data: previous } = useAgentActivity({
    organizationId,
    scope,
    enabled: !isRoleLoading,
    ...params,
    from: new Date(new Date(params.from).getTime() - length).toISOString(),
    to: params.from,
  })
  const isOrganization = scope === 'organization'
  const errorStatus = getSkillPresetErrorStatus(error)
  const hasAccessError = errorStatus === 401 || errorStatus === 403
  const activity = hasAccessError ? undefined : data
  useDocumentTitle(`${isOrganization ? 'Activity' : 'Your activity'} - Agents`)

  return (
    <AgentExperiencePage layout="dashboard" title="Activity">
      <div className="flex flex-col gap-3">
        <FilterBar search={search} setSearch={setSearch} scope={scope} lists={hasAccessError ? undefined : lists} />
      </div>

      {!isRoleLoading && !isLoading && error ? (
        isAgentActivityTimedOut(error) ? (
          // A busy range can take too long to read (q-core answers 503): a shorter one, or a filter, works.
          <Callout.Root color="yellow" role="alert" data-testid="activity-timed-out">
            <Callout.Icon>
              <Icon iconName="hourglass-end" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextHeading>{AGENT_ACTIVITY_TIMED_OUT_MESSAGE}</Callout.TextHeading>
              <Callout.TextDescription>You can also filter by member or skill.</Callout.TextDescription>
            </Callout.Text>
            <Button
              type="button"
              size="md"
              variant="outline"
              color="neutral"
              className="self-center"
              onClick={() => refetch()}
            >
              <Icon iconName="rotate-right" iconStyle="regular" />
              Try again
            </Button>
          </Callout.Root>
        ) : (
          <LoadError
            title={activity ? 'Agent activity could not be refreshed' : 'Agent activity could not be loaded'}
            error={error}
            onRetry={() => refetch()}
          />
        )
      ) : null}

      {isRoleLoading || isLoading ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading agent activity">
          <Skeleton height={72} className="w-full" show />
          <Skeleton height={240} className="w-full" show />
        </div>
      ) : activity ? (
        <div className={clsx(isFetching && 'opacity-70')} aria-busy={isFetching}>
          <ActivityContent
            activity={activity}
            previous={previous}
            scope={scope}
            organizationId={organizationId}
            search={search}
            setSearch={setSearch}
            bucket={range.bucket}
          />
        </div>
      ) : null}
    </AgentExperiencePage>
  )
}
