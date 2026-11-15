import { Link, useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  type AgentActivityBucket,
  type AgentActivityResponse,
  type AgentActivitySource,
} from '@qovery/domains/skill-presets/data-access'
import { SettingsHeading } from '@qovery/shared/console-shared'
import {
  Badge,
  Button,
  Callout,
  Chart,
  EmptyState,
  Heading,
  Icon,
  InputSelect,
  Section,
  SegmentedControl,
  Skeleton,
  TablePrimitives,
  Tooltip,
} from '@qovery/shared/ui'
import { dateFullFormat, timeAgo } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useAgentActivity } from '../hooks/use-agent-activity/use-agent-activity'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { LoadError } from '../load-error/load-error'
import { MockScenarioBanner } from '../mock-scenario-banner/mock-scenario-banner'
import {
  type AgentActivityHint,
  actionLabel,
  actorLabel,
  computeAgentActivityHints,
  groupActionsByType,
  neverLoadedSkills,
  targetLabel,
} from '../utils/agent-activity'

const { Table } = TablePrimitives

const RANGES: { value: string; label: string; hours: number; bucket: AgentActivityBucket }[] = [
  { value: '1d', label: '24 hours', hours: 24, bucket: 'HOUR' },
  { value: '7d', label: '7 days', hours: 24 * 7, bucket: 'DAY' },
  { value: '30d', label: '30 days', hours: 24 * 30, bucket: 'DAY' },
  { value: '90d', label: '90 days', hours: 24 * 90, bucket: 'DAY' },
]

const ALL = 'all'
const NO_SKILL = 'none'
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
}

type Scope = 'organization' | 'me'

interface Filters {
  range: string
  userSub: string
  skillName: string
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3">
      <dt className="text-xs text-neutral-subtle">{label}</dt>
      <dd className="text-base font-medium tabular-nums text-neutral">{value.toLocaleString('en-US')}</dd>
    </div>
  )
}

/** A name that narrows the whole page to it. Pressed when that filter is active. */
function DrillButton({
  label,
  active,
  onClick,
  mono,
}: {
  label: string
  active: boolean
  onClick: () => void
  mono?: boolean
}) {
  return (
    <Button
      type="button"
      variant="plain"
      color="neutral"
      size="xs"
      aria-pressed={active}
      onClick={onClick}
      className={clsx('h-auto px-0 text-left text-sm underline-offset-2 hover:underline', mono && 'font-code')}
    >
      {label}
    </Button>
  )
}

function OutcomeBadge({ outcome }: { outcome: 'ALLOWED' | 'DENIED' }) {
  return outcome === 'DENIED' ? (
    <Badge variant="surface" color="red" className="gap-1">
      <Icon iconName="ban" iconStyle="regular" aria-hidden="true" />
      Denied
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1">
      <Icon iconName="check" iconStyle="regular" aria-hidden="true" />
      Allowed
    </Badge>
  )
}

/** A member's name, or "Policy token <name>" with a key for an actor that is a policy token. */
function Actor({ userName }: { userName: string }) {
  const { kind, label } = actorLabel(userName)
  return kind === 'policy-token' ? (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <Icon iconName="key" iconStyle="regular" className="text-neutral-subtle" aria-hidden="true" />
      {label}
    </span>
  ) : (
    <>{label}</>
  )
}

function SkillName({ name }: { name: string | null }) {
  return name ? <span className="font-code">{name}</span> : <span className="text-neutral-subtle">No skill</span>
}

function HintLine({
  hint,
  organizationId,
  onShowMember,
}: {
  hint: AgentActivityHint
  organizationId: string
  onShowMember: (userSub: string) => void
}) {
  const policyTokensLink = (
    <Link
      to="/organization/$organizationId/settings/policy-api-token"
      params={{ organizationId }}
      className="font-medium text-brand hover:underline"
    >
      Review policy tokens
    </Link>
  )
  const presetsLink = (
    <Link
      to="/organization/$organizationId/settings/skill-presets"
      params={{ organizationId }}
      className="font-medium text-brand hover:underline"
    >
      Open skill presets
    </Link>
  )
  switch (hint.kind) {
    case 'unused-skills':
      return (
        <>
          <span>
            {hint.skills.length} Qovery {hint.skills.length === 1 ? 'skill was' : 'skills were'} not loaded in this
            period: <span className="font-code">{hint.skills.join(', ')}</span>. Consider turning them off in a preset.
          </span>
          {presetsLink}
        </>
      )
    case 'environment-denials':
      return (
        <>
          <span>
            {hint.count} agent actions were denied in <span className="font-code">{hint.environment}</span>.
          </span>
          {policyTokensLink}
        </>
      )
    case 'member-denials':
      // A policy token has no user sub: name it and point to its rules instead of drilling in.
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
          <Button
            type="button"
            variant="plain"
            color="brand"
            size="xs"
            className="h-auto px-0 text-sm"
            onClick={() => hint.userSub && onShowMember(hint.userSub)}
          >
            Show their activity
          </Button>
        </>
      )
    case 'loads-without-actions':
      return (
        <>
          <span>
            <span className="font-code">{hint.skillName}</span> was loaded {hint.loads} times and led to no Qovery
            action. That is expected for a checklist or a runbook.
          </span>
          {presetsLink}
        </>
      )
  }
}

function ActivityContent({
  activity,
  scope,
  organizationId,
  filters,
  setFilters,
  bucket,
}: {
  activity: AgentActivityResponse
  scope: Scope
  organizationId: string
  filters: Filters
  setFilters: (patch: Partial<Filters>) => void
  bucket: AgentActivityBucket
}) {
  const isOrganization = scope === 'organization'
  const filtered = filters.userSub !== ALL || filters.skillName !== ALL
  const hints = useMemo(
    () => (isOrganization ? computeAgentActivityHints(activity, { filtered }) : []),
    [activity, isOrganization, filtered]
  )
  const unused = useMemo(() => neverLoadedSkills(activity), [activity])
  const timeline = activity.timeline.map((point) => ({
    label: dateFullFormat(point.start, undefined, bucket === 'HOUR' ? 'HH:mm' : 'dd MMM'),
    // q-core counts allowed actions in `actions` and refused ones in `denials`.
    allowed: point.actions,
    denied: point.denials,
  }))
  const denied = activity.recent.filter(({ outcome }) => outcome === 'DENIED')
  const toggleSkill = (name: string | null) => {
    const value = name ?? NO_SKILL
    setFilters({ skillName: filters.skillName === value ? ALL : value })
  }
  const toggleMember = (userSub: string) => setFilters({ userSub: filters.userSub === userSub ? ALL : userSub })

  if (activity.totals.skill_loads + activity.totals.actions + activity.totals.denials === 0) {
    return (
      <EmptyState
        icon="robot"
        title={isOrganization ? 'No agent activity yet' : 'Your agent has no activity yet'}
        description="When a coding agent loads a Qovery skill or acts on Qovery through the API, the CLI or MCP, it shows here, with the skill that led to it."
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <dl
        className={clsx(
          'grid grid-cols-2 divide-x divide-neutral rounded-md border border-neutral',
          isOrganization ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
        )}
      >
        <Stat label="Skill loads" value={activity.totals.skill_loads} />
        <Stat label="Allowed actions" value={activity.totals.actions} />
        <Stat label="Denied actions" value={activity.totals.denials} />
        {isOrganization && <Stat label="Members with activity" value={activity.totals.members} />}
      </dl>

      <div className={clsx('grid grid-cols-1 gap-6', isOrganization && 'xl:grid-cols-[minmax(0,1fr)_360px]')}>
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
                <span className="h-2 w-3 rounded-sm bg-surface-negative-solid" /> Denied
              </span>
            </span>
          </div>
          <Chart.Container
            className="h-52"
            isEmpty={activity.totals.actions + activity.totals.denials === 0}
            aria-label="Agent actions over time, allowed and denied"
          >
            <BarChart data={timeline} margin={{ top: 8, bottom: 0, left: 0, right: 0 }}>
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
              <Bar dataKey="denied" stackId="actions" fill="var(--negative-9)" isAnimationActive={false} />
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
              <ul className="flex flex-col gap-3 text-sm text-neutral" data-testid="activity-suggestions">
                {hints.map((hint) => (
                  <li
                    key={`${hint.kind}-${'environment' in hint ? hint.environment : 'userName' in hint ? hint.userName : 'skillName' in hint ? hint.skillName : ''}`}
                    className="flex flex-col gap-1"
                  >
                    <HintLine hint={hint} organizationId={organizationId} onShowMember={toggleMember} />
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-neutral-subtle">Computed from this page’s data. No scores, no ranking.</p>
          </Section>
        )}
      </div>

      <Section aria-labelledby="activity-skills" className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <Heading level={2} id="activity-skills">
            Skills and what followed
          </Heading>
          <p className="text-xs text-neutral-subtle">{ATTRIBUTION_NOTE}</p>
        </div>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>
                <Tooltip content={ATTRIBUTION_NOTE}>
                  <span tabIndex={0} className="inline-flex items-center gap-1">
                    Skill
                    <Icon iconName="circle-info" iconStyle="regular" aria-hidden="true" />
                  </span>
                </Tooltip>
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="text-right">Loads</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="text-right">Actions</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="text-right">Denied</Table.ColumnHeaderCell>
              {isOrganization && <Table.ColumnHeaderCell className="text-right">Members</Table.ColumnHeaderCell>}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {activity.by_skill.map((row) => (
              <Table.Row key={row.skill_name ?? NO_SKILL}>
                <Table.Cell>
                  <DrillButton
                    label={row.skill_name ?? NO_SKILL_LABEL}
                    mono={Boolean(row.skill_name)}
                    active={filters.skillName === (row.skill_name ?? NO_SKILL)}
                    onClick={() => toggleSkill(row.skill_name)}
                  />
                </Table.Cell>
                <Table.Cell className="text-right tabular-nums">{row.loads}</Table.Cell>
                <Table.Cell className="text-right tabular-nums">{row.actions}</Table.Cell>
                <Table.Cell className="text-right tabular-nums">
                  {row.denials > 0 ? (
                    <span className="inline-flex items-center gap-1 text-negative">
                      <Icon iconName="ban" iconStyle="regular" aria-hidden="true" />
                      {row.denials}
                    </span>
                  ) : (
                    0
                  )}
                </Table.Cell>
                {isOrganization && <Table.Cell className="text-right tabular-nums">{row.members}</Table.Cell>}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        {isOrganization && !filtered && unused.length > 0 && (
          <p className="text-xs text-neutral-subtle" data-testid="never-loaded">
            Never loaded in this period: <span className="font-code">{unused.join(', ')}</span>. Consider turning them
            off in the preset.{' '}
            <Link
              to="/organization/$organizationId/settings/skill-presets"
              params={{ organizationId }}
              className="font-medium text-brand hover:underline"
            >
              Open skill presets
            </Link>
          </p>
        )}
      </Section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Section aria-labelledby="activity-types" className="flex flex-col gap-2">
          <Heading level={2} id="activity-types">
            Actions by type
          </Heading>
          <ul className="flex flex-col divide-y divide-neutral rounded-md border border-neutral text-sm">
            {groupActionsByType(activity.actions_by_type).map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="text-neutral">{row.label}</span>
                <span className="flex items-center gap-3 tabular-nums">
                  <span className="text-neutral">{row.count}</span>
                  {row.denied > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-negative">
                      <Icon iconName="ban" iconStyle="regular" aria-hidden="true" />
                      {row.denied} denied
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section aria-labelledby="activity-denied" className="flex flex-col gap-2">
          <Heading level={2} id="activity-denied">
            What was blocked
          </Heading>
          {denied.length === 0 ? (
            <p className="rounded-md border border-neutral p-4 text-sm text-neutral-subtle">
              No agent action was denied in this period.
            </p>
          ) : (
            <div className="flex flex-col gap-2 rounded-md border border-neutral p-4 text-sm">
              <ul className="flex flex-col gap-1.5" data-testid="denied-actions">
                {denied.slice(0, 6).map((action) => (
                  <li
                    key={`${action.at}-${action.user_name}-${action.target_name}`}
                    className="flex flex-wrap items-center gap-x-2 text-neutral"
                  >
                    <Icon iconName="ban" iconStyle="regular" className="text-negative" aria-hidden="true" />
                    <span>
                      {actionLabel(action.event, action.target_type)} on {targetLabel(action.target_type)}{' '}
                      <span className="font-code">{action.target_name}</span>
                      {action.environment_name && action.environment_name !== action.target_name ? (
                        <>
                          {' '}
                          in <span className="font-code">{action.environment_name}</span>
                        </>
                      ) : null}
                    </span>
                    <span className="text-xs text-neutral-subtle">
                      {isOrganization && (
                        <>
                          <Actor userName={action.user_name} />,{' '}
                        </>
                      )}
                      {timeAgo(new Date(action.at))} ago
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-neutral-subtle">
                Denied by the member’s role or the policy token the agent used. Adjust them in{' '}
                <Link
                  to="/organization/$organizationId/settings/policy-api-token"
                  params={{ organizationId }}
                  className="font-medium text-brand hover:underline"
                >
                  policy tokens
                </Link>{' '}
                or{' '}
                <Link
                  to="/organization/$organizationId/settings/skill-presets"
                  params={{ organizationId }}
                  className="font-medium text-brand hover:underline"
                >
                  skill presets
                </Link>
                .
              </p>
            </div>
          )}
        </Section>
      </div>

      {isOrganization && (
        <Section aria-labelledby="activity-members" className="flex flex-col gap-2">
          <Heading level={2} id="activity-members">
            By member
          </Heading>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Member</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-right">Skill loads</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-right">Actions</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-right">Denied</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Top skills</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Last activity</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {activity.by_member.map((row) => (
                <Table.Row key={row.user_sub ?? row.user_name}>
                  <Table.Cell>
                    {row.user_sub ? (
                      <DrillButton
                        label={row.user_name}
                        active={filters.userSub === row.user_sub}
                        onClick={() => row.user_sub && toggleMember(row.user_sub)}
                      />
                    ) : (
                      // No user sub (a policy token): it cannot be filtered on.
                      <span className="text-sm text-neutral">
                        <Actor userName={row.user_name} />
                      </span>
                    )}
                  </Table.Cell>
                  <Table.Cell className="text-right tabular-nums">{row.skill_loads}</Table.Cell>
                  <Table.Cell className="text-right tabular-nums">{row.actions}</Table.Cell>
                  <Table.Cell className="text-right tabular-nums">{row.denials}</Table.Cell>
                  <Table.Cell className="h-auto py-2">
                    <span className="flex flex-wrap gap-1">
                      {row.top_skills.length === 0 && <span className="text-neutral-subtle">None</span>}
                      {row.top_skills.map((skill) => (
                        <Badge key={skill} variant="surface" className="font-code">
                          {skill}
                        </Badge>
                      ))}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="text-neutral-subtle">{timeAgo(new Date(row.last_activity_at))} ago</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Section>
      )}

      <Section aria-labelledby="activity-recent" className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <Heading level={2} id="activity-recent">
            Recent actions
          </Heading>
          <p className="text-xs text-neutral-subtle">
            The latest {activity.recent.length} actions. What the agent did, never the prompt or the code.
          </p>
        </div>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>When</Table.ColumnHeaderCell>
              {isOrganization && <Table.ColumnHeaderCell>Member</Table.ColumnHeaderCell>}
              <Table.ColumnHeaderCell>Skill</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Action</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Target</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Environment</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Outcome</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {activity.recent.slice(0, 25).map((action) => (
              <Table.Row key={`${action.at}-${action.user_name}-${action.target_name}`}>
                <Table.Cell className="whitespace-nowrap">
                  <Tooltip content={dateFullFormat(action.at)}>
                    <span tabIndex={0}>{timeAgo(new Date(action.at))} ago</span>
                  </Tooltip>
                </Table.Cell>
                {isOrganization && (
                  <Table.Cell>
                    <Actor userName={action.user_name} />
                  </Table.Cell>
                )}
                <Table.Cell className="h-auto py-2">
                  <span className="flex items-center gap-1.5">
                    <SkillName name={action.skill_name} />
                    {action.origin === 'MCP_TOOL_CALL' && <Badge variant="outline">MCP</Badge>}
                  </span>
                </Table.Cell>
                <Table.Cell>{actionLabel(action.event, action.target_type)}</Table.Cell>
                <Table.Cell className="h-auto py-2">
                  <span className="flex flex-col">
                    <span className="font-code">{action.target_name}</span>
                    <span className="text-xs text-neutral-subtle">{targetLabel(action.target_type)}</span>
                  </span>
                </Table.Cell>
                <Table.Cell className="font-code text-xs">{action.environment_name ?? 'None'}</Table.Cell>
                <Table.Cell>
                  <OutcomeBadge outcome={action.outcome} />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Section>
    </div>
  )
}

/**
 * What coding agents did on Qovery, linked to the skills they loaded. Owners and admins see the
 * organization; anyone else sees only their own agent, with the same detail.
 */
export function AgentActivity() {
  const { organizationId = '' } = useParams({ strict: false })
  const { canManage, isLoading: isRoleLoading } = useCanManageSkillPresets({ organizationId })
  const scope: Scope = canManage ? 'organization' : 'me'
  const [filters, setFiltersState] = useState<Filters>({ range: '30d', userSub: ALL, skillName: ALL })
  const range = RANGES.find(({ value }) => value === filters.range) ?? RANGES[2]
  const to = useMemo(() => new Date(Math.ceil(Date.now() / 60_000) * 60_000), [])
  const params = {
    from: new Date(to.getTime() - range.hours * 3_600_000).toISOString(),
    to: to.toISOString(),
    bucket: range.bucket,
    userSub: scope === 'organization' && filters.userSub !== ALL ? filters.userSub : undefined,
    skillName: filters.skillName !== ALL && filters.skillName !== NO_SKILL ? filters.skillName : undefined,
  }
  const { data, isLoading, isFetching, error, refetch } = useAgentActivity({
    organizationId,
    scope,
    enabled: !isRoleLoading,
    ...params,
  })
  // Lists for the filter menus, from the unfiltered period.
  const { data: unfiltered } = useAgentActivity({
    organizationId,
    scope,
    enabled: !isRoleLoading,
    from: params.from,
    to: params.to,
    bucket: params.bucket,
  })
  const setFilters = (patch: Partial<Filters>) => setFiltersState((current) => ({ ...current, ...patch }))
  const title = scope === 'organization' ? 'Agent activity' : 'Your agent activity'
  const memberName = unfiltered?.by_member.find(({ user_sub }) => user_sub === filters.userSub)?.user_name
  useDocumentTitle(`${title} - Organization settings`)

  return (
    <Section className="px-8 pb-8 pt-6">
      <SettingsHeading
        title={isRoleLoading ? 'Agent activity' : title}
        description={
          scope === 'organization'
            ? 'What coding agents did on Qovery for your organization, and the skills that led to it.'
            : 'What your coding agent did on Qovery, and the skills that led to it. Only you and your organization’s owners and admins see this.'
        }
      />
      <div className="flex flex-col gap-6">
        <MockScenarioBanner />
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

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-neutral-subtle" id="activity-range-label">
              Period
            </span>
            <SegmentedControl.Root
              value={filters.range}
              onValueChange={(value) => setFilters({ range: value })}
              aria-labelledby="activity-range-label"
            >
              {RANGES.map((item) => (
                <SegmentedControl.Item key={item.value} value={item.value} className="text-xs">
                  {item.label}
                </SegmentedControl.Item>
              ))}
            </SegmentedControl.Root>
          </div>
          {scope === 'organization' && (
            <InputSelect
              className="w-52"
              label="Member"
              isSearchable
              value={filters.userSub}
              onChange={(value) => setFilters({ userSub: value as string })}
              options={[
                { value: ALL, label: 'All members' },
                // Policy tokens have no user sub, so they cannot be a filter.
                ...(unfiltered?.by_member ?? []).flatMap(({ user_sub, user_name }) =>
                  user_sub ? [{ value: user_sub, label: user_name }] : []
                ),
              ]}
            />
          )}
          <InputSelect
            className="w-52"
            label="Skill"
            isSearchable
            value={filters.skillName}
            onChange={(value) => setFilters({ skillName: value as string })}
            options={[
              { value: ALL, label: 'All skills' },
              ...(unfiltered?.by_skill ?? [])
                .filter(({ skill_name }) => skill_name)
                .map(({ skill_name }) => ({ value: skill_name ?? '', label: skill_name ?? '' })),
            ]}
          />
          {(filters.userSub !== ALL || filters.skillName !== ALL) && (
            <Button
              type="button"
              size="md"
              variant="plain"
              color="neutral"
              onClick={() => setFilters({ userSub: ALL, skillName: ALL })}
            >
              Clear filters
            </Button>
          )}
        </div>

        {(filters.userSub !== ALL || filters.skillName !== ALL) && (
          <p
            className="flex flex-wrap items-center gap-2 text-sm text-neutral"
            data-testid="activity-drill"
            aria-live="polite"
          >
            Showing
            {filters.userSub !== ALL && <Badge variant="surface">{memberName ?? 'one member'}</Badge>}
            {filters.skillName !== ALL && (
              <Badge variant="surface" className="font-code">
                {filters.skillName === NO_SKILL ? 'no skill' : filters.skillName}
              </Badge>
            )}
          </p>
        )}

        {isRoleLoading || isLoading ? (
          <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading agent activity">
            <Skeleton height={72} className="w-full" show />
            <Skeleton height={240} className="w-full" show />
          </div>
        ) : error ? (
          <LoadError title="Agent activity could not be loaded" error={error} onRetry={() => refetch()} />
        ) : data ? (
          <div className={clsx(isFetching && 'opacity-70')} aria-busy={isFetching}>
            <ActivityContent
              activity={
                filters.skillName === NO_SKILL
                  ? {
                      ...data,
                      by_skill: data.by_skill.filter(({ skill_name }) => !skill_name),
                      recent: data.recent.filter(({ skill_name }) => !skill_name),
                    }
                  : data
              }
              scope={scope}
              organizationId={organizationId}
              filters={filters}
              setFilters={setFilters}
              bucket={range.bucket}
            />
          </div>
        ) : null}
      </div>
    </Section>
  )
}
