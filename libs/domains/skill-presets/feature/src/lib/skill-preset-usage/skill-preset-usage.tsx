import { useParams } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  type SkillPresetUsageBucket,
  type SkillPresetUsageResponse,
  getSkillPresetErrorDetail,
} from '@qovery/domains/skill-presets/data-access'
import {
  Badge,
  Button,
  Callout,
  Chart,
  Heading,
  Icon,
  InputSelect,
  SegmentedControl,
  Skeleton,
  TablePrimitives,
} from '@qovery/shared/ui'
import { dateFullFormat, timeAgo } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useSkillPresetAssignees } from '../hooks/use-skill-preset-assignees/use-skill-preset-assignees'
import { useSkillPresetUsage } from '../hooks/use-skill-preset-usage/use-skill-preset-usage'
import { useSkillPresets } from '../hooks/use-skill-presets/use-skill-presets'
import { SkillPresetsLayout } from '../skill-presets-layout/skill-presets-layout'
import { formatTokens } from '../utils/token-budget'

const { Table } = TablePrimitives

const RANGES: { value: string; label: string; hours: number; bucket: SkillPresetUsageBucket }[] = [
  { value: '1d', label: '24 hours', hours: 24, bucket: 'HOUR' },
  { value: '7d', label: '7 days', hours: 24 * 7, bucket: 'DAY' },
  { value: '30d', label: '30 days', hours: 24 * 30, bucket: 'DAY' },
  { value: '90d', label: '90 days', hours: 24 * 90, bucket: 'DAY' },
]

const ALL = 'all'
const NO_PRESET = 'none'

interface UsageFilters {
  range: string
  skillName: string
  userSub: string
  skillPresetId: string
}

const percent = (part: number, total: number) => (total === 0 ? '0%' : `${Math.round((part / total) * 100)}%`)

function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3">
      <dt className="text-xs text-neutral-subtle">{label}</dt>
      <dd className="text-lg font-medium tabular-nums text-neutral">{value}</dd>
      {detail && <dd className="text-xs text-neutral-subtle">{detail}</dd>}
    </div>
  )
}

function DrillButton({ label, onClick, active }: { label: string; onClick: () => void; active: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="text-left font-medium text-neutral underline-offset-2 hover:text-brand hover:underline"
    >
      {label}
    </button>
  )
}

function UsageContent({ organizationId }: { organizationId: string }) {
  const [filters, setFilters] = useState<UsageFilters>({
    range: '30d',
    skillName: ALL,
    userSub: ALL,
    skillPresetId: ALL,
  })
  const range = RANGES.find(({ value }) => value === filters.range) ?? RANGES[2]
  // Rounded to the minute so the query key stays stable between renders.
  const to = useMemo(() => new Date(Math.floor(Date.now() / 60_000) * 60_000), [])
  const from = new Date(to.getTime() - range.hours * 3_600_000)
  const params = {
    from: from.toISOString(),
    to: to.toISOString(),
    bucket: range.bucket,
    skillName: filters.skillName === ALL ? undefined : filters.skillName,
    userSub: filters.userSub === ALL ? undefined : filters.userSub,
    skillPresetId: filters.skillPresetId === ALL ? undefined : filters.skillPresetId,
  }
  const { data, isLoading, isFetching, error } = useSkillPresetUsage({ organizationId, ...params })
  // Unfiltered lists feed the filter menus, so a filter never hides its own alternatives.
  const { data: unfiltered } = useSkillPresetUsage({
    organizationId,
    from: params.from,
    to: params.to,
    bucket: range.bucket,
  })
  const { data: presets = [] } = useSkillPresets({ organizationId })
  const { data: assignees } = useSkillPresetAssignees({ organizationId })

  const set = (patch: Partial<UsageFilters>) => setFilters((current) => ({ ...current, ...patch }))
  const hasFilter = filters.skillName !== ALL || filters.userSub !== ALL || filters.skillPresetId !== ALL

  if (error) {
    return (
      <Callout.Root color="red" role="alert">
        <Callout.Icon>
          <Icon iconName="circle-exclamation" iconStyle="regular" />
        </Callout.Icon>
        <Callout.Text>
          <Callout.TextHeading>Usage could not be loaded</Callout.TextHeading>
          <Callout.TextDescription>{getSkillPresetErrorDetail(error)}</Callout.TextDescription>
        </Callout.Text>
      </Callout.Root>
    )
  }

  const usage: SkillPresetUsageResponse | undefined = data
  const timeline = (usage?.timeline ?? []).map((point) => ({
    label: dateFullFormat(point.start, undefined, range.bucket === 'HOUR' ? 'HH:mm' : 'dd MMM'),
    fetched: point.loads - point.cached_loads,
    cached: point.cached_loads,
  }))
  const memberName = (userSub: string) =>
    unfiltered?.by_member.find(({ user_sub }) => user_sub === userSub)?.user_name ??
    assignees?.members.find(({ id }) => id === userSub)?.name ??
    userSub
  const byPreset = usage?.by_preset ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-neutral-subtle" id="usage-range-label">
            Period
          </span>
          <SegmentedControl.Root
            value={filters.range}
            onValueChange={(value) => set({ range: value })}
            aria-labelledby="usage-range-label"
          >
            {RANGES.map((item) => (
              <SegmentedControl.Item key={item.value} value={item.value} className="text-xs">
                {item.label}
              </SegmentedControl.Item>
            ))}
          </SegmentedControl.Root>
        </div>
        <InputSelect
          className="w-52"
          label="Skill"
          isSearchable
          value={filters.skillName}
          onChange={(value) => set({ skillName: value as string })}
          options={[
            { value: ALL, label: 'All skills' },
            ...(unfiltered?.by_skill ?? []).map(({ skill_name }) => ({ value: skill_name, label: skill_name })),
          ]}
        />
        <InputSelect
          className="w-52"
          label="Member"
          isSearchable
          value={filters.userSub}
          onChange={(value) => set({ userSub: value as string })}
          options={[
            { value: ALL, label: 'All members' },
            ...(unfiltered?.by_member ?? []).map(({ user_sub, user_name }) => ({ value: user_sub, label: user_name })),
          ]}
        />
        <InputSelect
          className="w-52"
          label="Preset"
          value={filters.skillPresetId}
          onChange={(value) => set({ skillPresetId: value as string })}
          options={[
            { value: ALL, label: 'All presets' },
            ...presets.map(({ id, name }) => ({ value: id, label: name })),
          ]}
        />
        {hasFilter && (
          <Button
            type="button"
            size="md"
            variant="plain"
            color="neutral"
            onClick={() => set({ skillName: ALL, userSub: ALL, skillPresetId: ALL })}
          >
            Clear filters
          </Button>
        )}
      </div>

      {isLoading || !usage ? (
        <Skeleton height={360} className="w-full" show />
      ) : (
        <div className={`flex flex-col gap-6 ${isFetching ? 'opacity-70' : ''}`} aria-busy={isFetching}>
          <dl className="grid grid-cols-2 divide-x divide-neutral rounded-md border border-neutral lg:grid-cols-4">
            <Stat label="Skill loads" value={usage.totals.loads.toLocaleString('en-US')} />
            <Stat
              label="Served from cache"
              value={percent(usage.totals.cached_loads, usage.totals.loads)}
              detail={`${usage.totals.cached_loads.toLocaleString('en-US')} loads sent nothing new`}
            />
            <Stat label="Members" value={usage.totals.members.toLocaleString('en-US')} />
            <Stat
              label="Organization text sent"
              value={`${formatTokens(usage.totals.approx_injected_tokens)} tokens`}
              detail="Your content and team context, cache misses only"
            />
          </dl>

          <section
            aria-labelledby="usage-timeline"
            className="flex flex-col gap-2 rounded-md border border-neutral p-4"
          >
            <div className="flex items-center justify-between">
              <Heading level={2} id="usage-timeline">
                Loads over time
              </Heading>
              <span className="flex items-center gap-4 text-xs text-neutral-subtle" aria-hidden="true">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-3 rounded-sm bg-surface-brand-solid" /> Fetched
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-3 rounded-sm bg-surface-neutral-solid" /> From cache
                </span>
              </span>
            </div>
            <Chart.Container
              className="h-56"
              isEmpty={usage.totals.loads === 0}
              aria-label="Skill loads over time, fetched and from cache"
            >
              <BarChart data={timeline} margin={{ top: 8, bottom: 0, left: 0, right: 0 }}>
                <CartesianGrid horizontal vertical={false} stroke="var(--neutral-4)" />
                <XAxis dataKey="label" tickLine={false} minTickGap={24} />
                <YAxis allowDecimals={false} width={32} tickLine={false} axisLine={false} />
                <Chart.Tooltip
                  content={
                    <Chart.TooltipContent
                      title="Skill loads"
                      formatLabel={(key) => (key === 'fetched' ? 'Fetched' : 'From cache')}
                    />
                  }
                />
                <Bar dataKey="fetched" stackId="loads" fill="var(--brand-9)" isAnimationActive={false} />
                <Bar dataKey="cached" stackId="loads" fill="var(--neutral-8)" isAnimationActive={false} />
              </BarChart>
            </Chart.Container>
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section aria-labelledby="usage-skills" className="flex flex-col gap-2">
              <Heading level={2} id="usage-skills">
                Top skills
              </Heading>
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Skill</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="text-right">Loads</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="text-right">Cache</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="text-right">Members</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Last load</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {usage.by_skill.slice(0, 10).map((row) => (
                    <Table.Row key={row.skill_name}>
                      <Table.Cell className="font-code">
                        <DrillButton
                          label={row.skill_name}
                          active={filters.skillName === row.skill_name}
                          onClick={() =>
                            set({ skillName: filters.skillName === row.skill_name ? ALL : row.skill_name })
                          }
                        />
                      </Table.Cell>
                      <Table.Cell className="text-right tabular-nums">{row.loads}</Table.Cell>
                      <Table.Cell className="text-right tabular-nums">
                        {percent(row.cached_loads, row.loads)}
                      </Table.Cell>
                      <Table.Cell className="text-right tabular-nums">{row.members}</Table.Cell>
                      <Table.Cell className="text-neutral-subtle">
                        {timeAgo(new Date(row.last_loaded_at))} ago
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </section>

            <section aria-labelledby="usage-members" className="flex flex-col gap-2">
              <Heading level={2} id="usage-members">
                Top members
              </Heading>
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Member</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="text-right">Loads</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="text-right">Skills</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Last load</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {usage.by_member.slice(0, 10).map((row) => (
                    <Table.Row key={row.user_sub}>
                      <Table.Cell>
                        <DrillButton
                          label={memberName(row.user_sub)}
                          active={filters.userSub === row.user_sub}
                          onClick={() => set({ userSub: filters.userSub === row.user_sub ? ALL : row.user_sub })}
                        />
                      </Table.Cell>
                      <Table.Cell className="text-right tabular-nums">{row.loads}</Table.Cell>
                      <Table.Cell className="text-right tabular-nums">{row.skills}</Table.Cell>
                      <Table.Cell className="text-neutral-subtle">
                        {timeAgo(new Date(row.last_loaded_at))} ago
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </section>
          </div>

          <section aria-labelledby="usage-presets" className="flex flex-col gap-2">
            <Heading level={2} id="usage-presets">
              By preset
            </Heading>
            <ul className="flex flex-col gap-2">
              {byPreset.map((row) => {
                const share = usage.totals.loads === 0 ? 0 : row.loads / usage.totals.loads
                return (
                  <li
                    key={row.skill_preset_id ?? NO_PRESET}
                    className="grid grid-cols-[200px_minmax(0,1fr)_80px] items-center gap-3 text-sm"
                  >
                    {row.skill_preset_id ? (
                      <DrillButton
                        label={row.skill_preset_name ?? 'Deleted preset'}
                        active={filters.skillPresetId === row.skill_preset_id}
                        onClick={() =>
                          set({
                            skillPresetId:
                              filters.skillPresetId === row.skill_preset_id ? ALL : row.skill_preset_id ?? ALL,
                          })
                        }
                      />
                    ) : (
                      <span className="text-neutral-subtle">No preset</span>
                    )}
                    <span className="h-2 overflow-hidden rounded-full bg-surface-neutral-component" aria-hidden="true">
                      <span className="block h-full bg-surface-brand-solid" style={{ width: `${share * 100}%` }} />
                    </span>
                    <span className="text-right tabular-nums text-neutral">
                      {row.loads} <span className="text-neutral-subtle">({Math.round(share * 100)}%)</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
          {hasFilter && (
            <p className="flex items-center gap-2 text-xs text-neutral-subtle">
              <Badge variant="surface">Filtered</Badge>
              Click a skill, member or preset again to remove its filter.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export function SkillPresetUsage() {
  const { organizationId = '' } = useParams({ strict: false })
  useDocumentTitle('Skill usage - Organization settings')
  return (
    <SkillPresetsLayout activeTab="usage">
      <UsageContent organizationId={organizationId} />
    </SkillPresetsLayout>
  )
}

export default SkillPresetUsage
