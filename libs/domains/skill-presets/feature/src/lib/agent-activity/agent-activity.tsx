import { type IconName } from '@fortawesome/fontawesome-common-types'
import { Link, useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  type AgentActionOrigin,
  type AgentActivityBucket,
  type AgentActivityResponse,
  type AgentActivitySource,
  type AgentActorType,
} from '@qovery/domains/skill-presets/data-access'
import {
  Badge,
  Button,
  Callout,
  Chart,
  EmptyState,
  Heading,
  Icon,
  InputSelect,
  Pagination,
  Section,
  SegmentedControl,
  Skeleton,
  TablePrimitives,
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
  neverLoadedSkills,
  peopleRows,
  policyTokenName,
  targetLabel,
} from '../utils/agent-activity'
import {
  ACTIVITY_RANGES,
  type ActivitySearch,
  DEFAULT_RANGE,
  NO_SKILL,
  SOURCE_FILTER_LABELS,
  activityParams,
  activityRange,
  hasActivityFilters,
  memberActor,
  parseActor,
  tokenActor,
} from './activity-search'
import { useActivitySearch } from './use-activity-search'

const { Table } = TablePrimitives

const ALL = 'all'
const NOTE_SEEN_KEY = 'agents-activity-coverage-note-seen'
const ATTRIBUTION_NOTE =
  'Actions are matched to people by username and to skills by the agent’s user agent; treat them as indicative.'
const NO_SKILL_LABEL = 'No skill (MCP or API)'
const DEFAULT_COVERAGE_NOTE =
  'Only actions taken through Qovery (its API, CLI, skills and MCP server) are visible. What an agent does elsewhere, such as in a shell, in git or in a cloud console, is not.'
const SOURCE_LABELS: Record<AgentActivitySource, string> = {
  SKILL_LOAD: 'skill loads',
  SKILL_API_ACTION: 'API calls from skills',
  MCP_TOOL_CALL: 'MCP tool calls',
  POLICY_DENIAL: 'refused requests',
  POLICY_TOKEN_API_ACTION: 'policy token calls',
}
const ORIGIN_BADGES: Record<AgentActionOrigin, string | null> = {
  SKILL_API_ACTION: null,
  MCP_TOOL_CALL: 'MCP',
  POLICY_DENIAL: null,
  POLICY_TOKEN_API_ACTION: 'API',
}

type Scope = 'organization' | 'me'
type Breakdown = 'member' | 'token' | 'skill'

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
      className="h-auto px-0 text-left text-sm underline-offset-2 hover:underline"
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
  const policyTokensLink = (
    <Link
      to="/organization/$organizationId/agent-experience/policy-tokens"
      params={{ organizationId }}
      className="font-medium text-brand hover:underline"
    >
      Review policy tokens
    </Link>
  )
  const presetsLink = (
    <Link
      to="/organization/$organizationId/agent-experience/skill-presets"
      params={{ organizationId }}
      className="font-medium text-brand hover:underline"
    >
      Open the Skills registry
    </Link>
  )
  const showButton = (label: string, onClick: () => void) => (
    <Button type="button" variant="plain" color="brand" size="xs" className="h-auto px-0 text-sm" onClick={onClick}>
      {label}
    </Button>
  )
  switch (hint.kind) {
    case 'unused-skills':
      return (
        <>
          <span>
            {hint.skills.length} Qovery {hint.skills.length === 1 ? 'skill was' : 'skills were'} not loaded in this
            period: <span className="font-sans">{hint.skills.join(', ')}</span>. Consider turning them off in a preset.
          </span>
          {presetsLink}
        </>
      )
    case 'environment-denials':
      return (
        <>
          <span>
            {hint.count} agent actions were denied in <span className="font-sans">{hint.environment}</span>.
          </span>
          {policyTokensLink}
        </>
      )
    case 'member-denials':
      // An older API names a policy token here, with no user sub: point to its rules instead.
      if (!hint.userSub) {
        return (
          <>
            <span>
              <Actor userName={hint.userName} /> had {hint.count} actions denied.
            </span>
            {policyTokensLink}
          </>
        )
      }
      return (
        <>
          <span>
            {hint.userName}’s agent had {hint.count} actions denied.
          </span>
          {showButton('Show their activity', () => hint.userSub && onShowMember(hint.userSub))}
        </>
      )
    case 'token-denials':
      return (
        <>
          <span className="inline-flex flex-wrap items-center gap-1">
            <ActorChip
              kind="policy-token"
              name={hint.tokenName}
              deleted={hint.deleted}
              prefix={Boolean(hint.tokenId)}
            />{' '}
            had {hint.count} calls denied by its policy.
          </span>
          {onShowToken && hint.tokenId
            ? showButton('Show its activity', () => hint.tokenId && onShowToken(hint.tokenId))
            : policyTokensLink}
        </>
      )
    case 'loads-without-actions':
      return (
        <>
          <span>
            <span className="font-sans">{hint.skillName}</span> was loaded {hint.loads} times and led to no Qovery
            action. That is expected for a checklist or a runbook.
          </span>
          {presetsLink}
        </>
      )
  }
}

/**
 * One toolbar row, as on Audit logs: the period on the left, then actor, skill, source and outcome,
 * then Clear filters on the right. Every change goes to the URL.
 */
function FilterBar({
  search,
  setSearch,
  scope,
  lists,
}: {
  search: ActivitySearch
  setSearch: (patch: Partial<ActivitySearch>) => void
  scope: Scope
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
    <div className="flex flex-wrap items-end gap-2" data-testid="activity-filters" role="toolbar" aria-label="Filters">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-neutral-subtle" id="activity-range-label">
          Period
        </span>
        <SegmentedControl.Root
          value={search.range ?? DEFAULT_RANGE}
          onValueChange={(value) => set({ range: value === DEFAULT_RANGE ? undefined : value })}
          aria-labelledby="activity-range-label"
        >
          {ACTIVITY_RANGES.map((item) => (
            <SegmentedControl.Item key={item.value} value={item.value} className="text-xs">
              {item.label}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl.Root>
      </div>
      {scope === 'organization' && (
        <InputSelect
          className="w-48 shrink-0"
          label="Actor"
          isSearchable
          value={search.actor ?? ALL}
          onChange={(value) => set({ actor: value === ALL ? undefined : (value as string) })}
          options={actorOptions}
        />
      )}
      <InputSelect
        className="w-44 shrink-0"
        label="Skill"
        isSearchable
        value={search.skill ?? ALL}
        onChange={(value) => set({ skill: value === ALL ? undefined : (value as string) })}
        options={[
          { value: ALL, label: 'All skills' },
          { value: NO_SKILL, label: NO_SKILL_LABEL },
          ...(lists?.by_skill ?? []).flatMap(({ skill_name }) =>
            skill_name ? [{ value: skill_name, label: skill_name }] : []
          ),
        ]}
      />
      <InputSelect
        className="w-44 shrink-0"
        label="Source"
        value={search.via ?? ALL}
        onChange={(value) => set({ via: value === ALL ? undefined : (value as ActivitySearch['via']) })}
        options={[
          { value: ALL, label: 'All sources' },
          ...Object.entries(SOURCE_FILTER_LABELS).map(([value, label]) => ({ value, label: label ?? value })),
        ]}
      />
      <InputSelect
        className="w-36 shrink-0"
        label="Outcome"
        value={search.outcome ?? ALL}
        onChange={(value) => set({ outcome: value === ALL ? undefined : (value as ActivitySearch['outcome']) })}
        options={[
          { value: ALL, label: 'All outcomes' },
          { value: 'ALLOWED', label: 'Allowed' },
          { value: 'DENIED', label: 'Denied' },
        ]}
      />
      {hasActivityFilters(search) && (
        <Button
          type="button"
          size="md"
          variant="plain"
          color="neutral"
          className="ml-auto"
          onClick={() => set({ actor: undefined, skill: undefined, outcome: undefined, via: undefined })}
        >
          Clear filters
        </Button>
      )}
    </div>
  )
}

/** The active filters, as chips that each remove one filter. */
function ActiveFilters({
  search,
  setSearch,
  lists,
}: {
  search: ActivitySearch
  setSearch: (patch: Partial<ActivitySearch>) => void
  lists?: AgentActivityResponse
}) {
  if (!hasActivityFilters(search)) return null
  const actor = parseActor(search.actor)
  const member = lists?.by_member.find(({ user_sub }) => user_sub && user_sub === actor.userSub)
  const token = lists?.by_policy_token.find(({ policy_token_id }) => policy_token_id === actor.policyTokenId)
  const chips: { key: keyof ActivitySearch; label: ReactNode }[] = []
  if (search.actor) {
    chips.push({
      key: 'actor',
      label:
        search.actor === 'members' ? (
          'All members'
        ) : search.actor === 'tokens' ? (
          'All policy tokens'
        ) : token || actor.policyTokenId ? (
          <ActorChip kind="policy-token" name={token ? policyTokenName(token) : 'unknown'} deleted={token?.deleted} />
        ) : (
          <ActorChip kind="member" name={member?.user_name ?? 'one member'} />
        ),
    })
  }
  if (search.skill) chips.push({ key: 'skill', label: search.skill === NO_SKILL ? 'No skill' : search.skill })
  if (search.via) chips.push({ key: 'via', label: SOURCE_FILTER_LABELS[search.via] ?? search.via })
  if (search.outcome) chips.push({ key: 'outcome', label: search.outcome === 'DENIED' ? 'Denied' : 'Allowed' })
  return (
    <div
      className="flex flex-wrap items-center gap-2 text-sm text-neutral"
      data-testid="activity-drill"
      aria-live="polite"
    >
      Showing
      {chips.map(({ key, label }) => (
        <Badge key={key} variant="surface" size="base" className="gap-1 font-medium">
          {label}
          <button
            type="button"
            className="text-neutral-subtle hover:text-neutral"
            aria-label={`Remove the ${key === 'via' ? 'source' : key} filter`}
            onClick={() => setSearch({ [key]: undefined })}
          >
            <Icon iconName="xmark" iconStyle="regular" />
          </button>
        </Badge>
      ))}
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
  scope: Scope
  search: ActivitySearch
  setSearch: (patch: Partial<ActivitySearch>) => void
}) {
  const { organizationId = '' } = useParams({ strict: false })
  const isOrganization = scope === 'organization'
  // Follows the actor filter (tokens show by token) until someone picks another breakdown.
  const actor = parseActor(search.actor)
  const automatic: Breakdown = !isOrganization
    ? 'skill'
    : actor.policyTokenId || actor.actorType === 'POLICY_TOKEN'
      ? 'token'
      : 'member'
  // The chosen breakdown is in the URL (`view`), so a shared link keeps it.
  const breakdown: Breakdown = isOrganization ? search.view ?? automatic : 'skill'
  const setBreakdown = (view: Breakdown) => setSearch({ view: view === automatic ? undefined : view })
  const toggle = (key: 'actor' | 'skill', value: string) =>
    setSearch({ [key]: search[key] === value ? undefined : value, page: undefined })
  const unused = neverLoadedSkills(activity)
  const tokens = activity.by_policy_token ?? []
  const people = peopleRows(activity)

  return (
    <Section aria-labelledby="activity-breakdown" className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Heading level={2} id="activity-breakdown">
            Breakdown
          </Heading>
          <Tooltip content={ATTRIBUTION_NOTE}>
            <span tabIndex={0} aria-label="About activity attribution">
              <Icon iconName="circle-info" iconStyle="regular" className="text-neutral-subtle" />
            </span>
          </Tooltip>
        </div>
        {isOrganization && (
          <SegmentedControl.Root
            value={breakdown}
            onValueChange={(value) => setBreakdown(value as Breakdown)}
            aria-label="Breakdown"
          >
            <SegmentedControl.Item value="member" className="text-xs">
              By member
            </SegmentedControl.Item>
            <SegmentedControl.Item value="token" className="text-xs">
              By token
            </SegmentedControl.Item>
            <SegmentedControl.Item value="skill" className="text-xs">
              By skill
            </SegmentedControl.Item>
          </SegmentedControl.Root>
        )}
      </div>
      <Table.Root data-testid={`breakdown-${breakdown}`}>
        {breakdown === 'member' && (
          <>
            <Table.Header className="[&_th]:text-xs">
              <Table.Row>
                <Table.ColumnHeaderCell>Member</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-right">Skill loads</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-right">Allowed</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-right">Denied</Table.ColumnHeaderCell>
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
                  <Table.Cell className="text-right tabular-nums">{row.skill_loads}</Table.Cell>
                  <Table.Cell className="text-right tabular-nums">{row.actions}</Table.Cell>
                  <Table.Cell className="text-right tabular-nums">
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
                <Table.ColumnHeaderCell className="text-right">Allowed</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-right">Denied</Table.ColumnHeaderCell>
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
                    <Table.Cell className="text-right tabular-nums">{row.actions}</Table.Cell>
                    <Table.Cell className="text-right tabular-nums">
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
                <Table.ColumnHeaderCell className="text-right">Loads</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-right">Allowed</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-right">Denied</Table.ColumnHeaderCell>
                {isOrganization && <Table.ColumnHeaderCell className="text-right">Members</Table.ColumnHeaderCell>}
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
              {activity.by_skill.map((row) => (
                <Table.Row key={row.skill_name ?? NO_SKILL}>
                  <Table.Cell>
                    <DrillButton
                      active={search.skill === (row.skill_name ?? NO_SKILL)}
                      onClick={() => toggle('skill', row.skill_name ?? NO_SKILL)}
                    >
                      {row.skill_name ?? NO_SKILL_LABEL}
                    </DrillButton>
                  </Table.Cell>
                  <Table.Cell className="text-right tabular-nums">{row.loads}</Table.Cell>
                  <Table.Cell className="text-right tabular-nums">{row.actions}</Table.Cell>
                  <Table.Cell className="text-right tabular-nums">
                    <DeniedCount value={row.denials} />
                  </Table.Cell>
                  {isOrganization && <Table.Cell className="text-right tabular-nums">{row.members}</Table.Cell>}
                </Table.Row>
              ))}
            </Table.Body>
          </>
        )}
      </Table.Root>
      {breakdown === 'skill' && isOrganization && !hasActivityFilters(search) && unused.length > 0 && (
        <p className="text-xs text-neutral-subtle" data-testid="never-loaded">
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

const PAGE_SIZE_DEFAULT = 30
const HINT_ICONS: Record<AgentActivityHint['kind'], IconName> = {
  'unused-skills': 'sliders',
  'environment-denials': 'ban',
  'member-denials': 'user',
  'token-denials': 'key',
  'loads-without-actions': 'sparkles',
}

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
  periodLabel,
}: {
  activity: AgentActivityResponse
  previous?: AgentActivityResponse
  scope: Scope
  organizationId: string
  search: ActivitySearch
  setSearch: (patch: Partial<ActivitySearch>) => void
  bucket: AgentActivityBucket
  periodLabel: string
}) {
  const isOrganization = scope === 'organization'
  const filtered = hasActivityFilters(search)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT)
  const [actionType, setActionType] = useState(ALL)
  const hints = useMemo(
    () => (isOrganization ? computeAgentActivityHints(activity, { filtered }) : []),
    [activity, isOrganization, filtered]
  )
  const timeline = fillTimeline(activity.timeline, activity, (start) => ({
    start,
    skill_loads: 0,
    actions: 0,
    denials: 0,
  })).map((point) => ({
    label: dateFullFormat(point.start, undefined, bucket === 'HOUR' ? 'HH:mm' : 'dd MMM'),
    // q-core counts allowed actions in `actions` and refused ones in `denials`.
    allowed: point.actions,
    denied: point.denials,
  }))
  const denied = activity.recent.filter(({ outcome }) => outcome === 'DENIED')
  const actorFilter = parseActor(search.actor)
  const tokensOnly = isOrganization && Boolean(actorFilter.policyTokenId || actorFilter.actorType === 'POLICY_TOKEN')
  const delta = (current: number, before?: number) => (before === undefined ? undefined : current - before)

  // Recent actions: an action type filter on the table, then pages.
  // Types of action only: a refused request is an outcome, filtered with Outcome.
  const actionTypes = [
    ...new Set(
      activity.recent
        .filter(({ outcome }) => outcome === 'ALLOWED')
        .map(({ event, target_type }) => actionLabel(event, target_type))
    ),
  ]
  const rows = activity.recent.filter(
    ({ event, target_type }) => actionType === ALL || actionLabel(event, target_type) === actionType
  )
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
    <div className="flex flex-col gap-6">
      {tokensOnly ? (
        // Skill loads and members are people's: they say nothing about policy tokens.
        <StatGrid columns={3} period={periodLabel}>
          <Stat
            label="Allowed actions"
            value={activity.totals.actions}
            delta={delta(activity.totals.actions, previous?.totals.actions)}
          />
          <Stat
            label="Denied actions"
            icon="ban"
            value={activity.totals.denials}
            delta={delta(activity.totals.denials, previous?.totals.denials)}
            riseIsBad
          />
          <Stat label="Policy tokens with activity" value={activity.totals.policy_tokens ?? 0} />
        </StatGrid>
      ) : (
        <StatGrid columns={isOrganization ? 5 : 3} period={periodLabel}>
          <Stat
            label="Skill loads"
            value={activity.totals.skill_loads}
            delta={delta(activity.totals.skill_loads, previous?.totals.skill_loads)}
          />
          <Stat
            label="Allowed actions"
            value={activity.totals.actions}
            delta={delta(activity.totals.actions, previous?.totals.actions)}
          />
          <Stat
            label="Denied actions"
            icon="ban"
            value={activity.totals.denials}
            delta={delta(activity.totals.denials, previous?.totals.denials)}
            riseIsBad
          />
          {isOrganization && (
            <Stat
              label="Members with agents"
              value={memberCount(activity)}
              delta={previous ? memberCount(activity) - memberCount(previous) : undefined}
            />
          )}
          {isOrganization && <Stat label="Policy tokens with activity" value={activity.totals.policy_tokens ?? 0} />}
        </StatGrid>
      )}

      <div
        className={clsx('grid grid-cols-1 items-start gap-6', isOrganization && 'xl:grid-cols-[minmax(0,1fr)_400px]')}
      >
        <Section
          aria-labelledby="activity-timeline"
          className="flex flex-col gap-2 rounded-md border border-neutral p-4"
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
            className="h-52"
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
                content={
                  <Chart.TooltipContent
                    title="Actions"
                    formatLabel={(key) => (key === 'allowed' ? 'Allowed' : 'Denied')}
                  />
                }
              />
              <Bar dataKey="allowed" stackId="actions" fill="var(--brand-9)" isAnimationActive={false} />
              <Bar dataKey="denied" stackId="actions" fill="url(#denied-hatch)" isAnimationActive={false} />
            </BarChart>
          </Chart.Container>
        </Section>

        {isOrganization && (
          <Section
            aria-labelledby="activity-suggestions"
            className="flex flex-col gap-3 rounded-md border border-neutral p-4"
          >
            <Heading level={2} id="activity-suggestions">
              Suggestions
            </Heading>
            {hints.length === 0 ? (
              <p className="text-sm text-neutral-subtle">Nothing to adjust in this period.</p>
            ) : (
              <ul
                className="flex flex-col divide-y divide-neutral text-sm text-neutral"
                data-testid="activity-suggestions"
              >
                {hints.map((hint) => (
                  <li
                    key={`${hint.kind}-${'environment' in hint ? hint.environment : 'tokenId' in hint ? hint.tokenId : 'userName' in hint ? hint.userName : 'skillName' in hint ? hint.skillName : ''}`}
                    className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0"
                  >
                    <Icon
                      iconName={HINT_ICONS[hint.kind]}
                      iconStyle="regular"
                      className="mt-0.5 text-neutral-subtle"
                      aria-hidden="true"
                    />
                    <span className="flex min-w-0 flex-1 items-start justify-between gap-3 [&>*:last-child]:shrink-0 [&>*:last-child]:whitespace-nowrap">
                      <HintLine
                        hint={hint}
                        organizationId={organizationId}
                        onShowMember={(userSub) => setSearch({ actor: memberActor(userSub), page: undefined })}
                        onShowToken={(tokenId) => setSearch({ actor: tokenActor(tokenId), page: undefined })}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-neutral-subtle">Computed from this page’s data. No scores, no ranking.</p>
          </Section>
        )}
      </div>

      <Section aria-labelledby="activity-recent" className="flex flex-col gap-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Heading level={2} id="activity-recent">
              Recent actions
            </Heading>
            <p className="text-xs text-neutral-subtle" data-testid="recent-count">
              {rows.length === 0
                ? 'No action of this type in this period.'
                : `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, rows.length)} of ${rows.length} actions in this period. What the agent did, never the prompt or the code.`}
            </p>
          </div>
          <InputSelect
            className="w-52"
            label="Action"
            value={actionType}
            onChange={(value) => {
              setActionType(value as string)
              setSearch({ page: undefined })
            }}
            options={[{ value: ALL, label: 'All actions' }, ...actionTypes.map((label) => ({ value: label, label }))]}
          />
        </div>
        <Table.Root>
          <Table.Header className="[&_th]:text-xs">
            <Table.Row>
              <Table.ColumnHeaderCell>When</Table.ColumnHeaderCell>
              {isOrganization && <Table.ColumnHeaderCell>Actor</Table.ColumnHeaderCell>}
              <Table.ColumnHeaderCell>Skill</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Action</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Target</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Environment</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Outcome</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {pageRows.map((action) => (
              <Table.Row key={`${action.at}-${action.user_name}-${action.target_name}`} data-outcome={action.outcome}>
                <Table.Cell className="whitespace-nowrap">
                  {/* The full date on hover, without a tab stop on every row. */}
                  <time dateTime={action.at} title={dateFullFormat(action.at)}>
                    {timeAgo(new Date(action.at))} ago
                  </time>
                </Table.Cell>
                {isOrganization && (
                  <Table.Cell>
                    <Actor userName={action.user_name} kind={action.actor_kind} />
                  </Table.Cell>
                )}
                <Table.Cell className="h-auto py-3">
                  <span className="flex items-center gap-1.5">
                    <SkillName name={action.skill_name} />
                    {ORIGIN_BADGES[action.origin] && (
                      <Badge variant="surface" size="base" className="font-medium">
                        {ORIGIN_BADGES[action.origin]}
                      </Badge>
                    )}
                  </span>
                </Table.Cell>
                <Table.Cell>{actionLabel(action.event, action.target_type)}</Table.Cell>
                <Table.Cell className="h-auto py-3">
                  <span className="flex flex-col">
                    <span className="font-sans">{action.target_name}</span>
                    <span className="text-ssm text-neutral-subtle">{targetLabel(action.target_type)}</span>
                  </span>
                </Table.Cell>
                <Table.Cell className="text-sm">{action.environment_name ?? 'None'}</Table.Cell>
                <Table.Cell>
                  <OutcomeBadge outcome={action.outcome} />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        {rows.length > pageSize || page > 1 ? (
          <Pagination
            className="pt-2"
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

      <BreakdownTable activity={activity} scope={scope} search={search} setSearch={setSearch} />

      <Section aria-labelledby="activity-denied" className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Heading level={2} id="activity-denied">
            What was blocked
          </Heading>
          {denied.length > 0 && search.outcome !== 'DENIED' && (
            <span className="text-xs text-neutral-subtle" data-testid="denied-count">
              {Math.min(denied.length, 6)} of {activity.totals.denials} shown.{' '}
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
          <p className="rounded-md border border-neutral p-4 text-sm text-neutral-subtle">
            No agent action was denied in this period.
          </p>
        ) : (
          <div className="flex flex-col gap-2 rounded-md border border-neutral p-4 text-sm">
            <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2" data-testid="denied-actions">
              {denied.slice(0, 6).map((action) => (
                <li key={`${action.at}-${action.user_name}-${action.target_name}`} className="flex flex-col">
                  <span className="inline-flex flex-wrap items-center gap-x-1.5 text-neutral">
                    <Icon iconName="ban" iconStyle="regular" className="text-negative" aria-hidden="true" />
                    {actionLabel(action.event, action.target_type)} on {targetLabel(action.target_type)}
                    <span className="font-sans">{action.target_name}</span>
                    {action.environment_name && action.environment_name !== action.target_name ? (
                      <>
                        in <span className="font-sans">{action.environment_name}</span>
                      </>
                    ) : null}
                  </span>
                  <span className="flex items-center gap-1.5 pl-5 text-xs text-neutral-subtle">
                    {isOrganization && <Actor userName={action.user_name} kind={action.actor_kind} />}
                    <span>{timeAgo(new Date(action.at))} ago</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-neutral-subtle">
              Denied by the member’s role or the policy token the agent used. Adjust them in{' '}
              <Link
                to="/organization/$organizationId/agent-experience/policy-tokens"
                params={{ organizationId }}
                className="font-medium text-brand hover:underline"
              >
                policy tokens
              </Link>{' '}
              or{' '}
              <Link
                to="/organization/$organizationId/agent-experience/skill-presets"
                params={{ organizationId }}
                className="font-medium text-brand hover:underline"
              >
                the Skills registry
              </Link>
              .
            </p>
          </div>
        )}
      </Section>
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
  const scope: Scope = canManage ? 'organization' : 'me'
  const [search, setSearch] = useActivitySearch()
  const range = activityRange(search)
  const to = useMemo(() => new Date(Math.ceil(Date.now() / 60_000) * 60_000), [])
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
  // The privacy note in full the first time, then in one line.
  const [noteSeen] = useState(() => window.localStorage.getItem(NOTE_SEEN_KEY) === 'true')
  useEffect(() => window.localStorage.setItem(NOTE_SEEN_KEY, 'true'), [])
  const activity =
    data && search.skill === NO_SKILL
      ? {
          ...data,
          by_skill: data.by_skill.filter(({ skill_name }) => !skill_name),
          recent: data.recent.filter(({ skill_name }) => !skill_name),
        }
      : data
  useDocumentTitle(`${isOrganization ? 'Activity' : 'Your activity'} - Agents`)

  return (
    <AgentExperiencePage
      title={isRoleLoading ? 'Activity' : isOrganization ? 'Activity' : 'Your activity'}
      description={
        isOrganization
          ? 'What agents did on Qovery, and what was refused.'
          : 'What your coding agent did on Qovery. Only you and your owners and admins see this.'
      }
    >
      <FilterBar search={search} setSearch={setSearch} scope={scope} lists={lists} />
      <ActiveFilters search={search} setSearch={setSearch} lists={lists} />

      {noteSeen ? (
        <p className="flex items-center gap-2 text-xs text-neutral-subtle" data-testid="coverage-note">
          <Icon iconName="eye" iconStyle="regular" aria-hidden="true" />
          Only actions taken through Qovery are visible. Prompts and code are never collected.
        </p>
      ) : (
        <Callout.Root color="neutral" data-testid="coverage-note">
          <Callout.Icon>
            <Icon iconName="eye" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextDescription>
              {data?.coverage.note ?? DEFAULT_COVERAGE_NOTE} Prompts and code are never collected.
              {data && data.coverage.sources.length > 0 && (
                <span className="mt-1 block text-xs text-neutral-subtle" data-testid="coverage-sources">
                  Sources: {data.coverage.sources.map((source) => SOURCE_LABELS[source] ?? source).join(', ')}.
                </span>
              )}
            </Callout.TextDescription>
          </Callout.Text>
        </Callout.Root>
      )}

      {isRoleLoading || isLoading ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading agent activity">
          <Skeleton height={72} className="w-full" show />
          <Skeleton height={240} className="w-full" show />
        </div>
      ) : error ? (
        <LoadError title="Agent activity could not be loaded" error={error} onRetry={() => refetch()} />
      ) : activity ? (
        <div className={clsx(isFetching && 'opacity-70')} aria-busy={isFetching}>
          <ActivityContent
            activity={activity}
            previous={previous}
            periodLabel={`Last ${range.label}`}
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
