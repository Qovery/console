import { useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { type SkillPresetUsageBucket, type SkillPresetUsageResponse } from '@qovery/domains/skill-presets/data-access'
import { Button, Chart, Heading, InputSelectSmall, Skeleton, TablePrimitives } from '@qovery/shared/ui'
import { dateFullFormat, timeAgo } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useSkillPresetAssignees } from '../hooks/use-skill-preset-assignees/use-skill-preset-assignees'
import { useSkillPresetUsage } from '../hooks/use-skill-preset-usage/use-skill-preset-usage'
import { useSkillPresets } from '../hooks/use-skill-presets/use-skill-presets'
import { LoadError } from '../load-error/load-error'
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
const TOP_LIMIT = 5

interface UsageFilters {
  range: string
  skillName: string
  userSub: string
  skillPresetId: string
}

const percent = (part: number, total: number) => (total === 0 ? '0%' : `${Math.round((part / total) * 100)}%`)

function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="flex min-h-28 flex-col justify-between gap-3 rounded-md border border-neutral bg-surface-neutral px-4 py-3">
      <dt className="text-xs text-neutral-subtle">{label}</dt>
      <dd className="text-3xl font-medium tabular-nums text-neutral">{value}</dd>
      {detail && <dd className="text-xs text-neutral-subtle">{detail}</dd>}
    </div>
  )
}

function DrillButton({ label, onClick, active }: { label: string; onClick: () => void; active: boolean }) {
  return (
    <Button
      type="button"
      variant="plain"
      color="neutral"
      size="xs"
      onClick={onClick}
      aria-pressed={active}
      className="h-auto px-0 text-left text-sm font-normal underline-offset-2 hover:underline"
    >
      {label}
    </Button>
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
  const { data, isLoading, isFetching, error, refetch } = useSkillPresetUsage({ organizationId, ...params })
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
    return <LoadError title="Usage could not be loaded" error={error} onRetry={() => refetch()} />
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
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <InputSelectSmall
          className="w-48 shrink-0"
          inputClassName="h-8"
          name="skill"
          ariaLabel="Skill"
          defaultValue={filters.skillName}
          onChange={(value) => set({ skillName: value as string })}
          items={[
            { value: ALL, label: 'All skills' },
            ...(unfiltered?.by_skill ?? []).map(({ skill_name }) => ({ value: skill_name, label: skill_name })),
          ]}
        />
        <InputSelectSmall
          className="w-48 shrink-0"
          inputClassName="h-8"
          name="member"
          ariaLabel="Member"
          defaultValue={filters.userSub}
          onChange={(value) => set({ userSub: value as string })}
          items={[
            { value: ALL, label: 'All members' },
            ...(unfiltered?.by_member ?? []).map(({ user_sub, user_name }) => ({ value: user_sub, label: user_name })),
          ]}
        />
        <InputSelectSmall
          className="w-48 shrink-0"
          inputClassName="h-8"
          name="preset"
          ariaLabel="Preset"
          defaultValue={filters.skillPresetId}
          onChange={(value) => set({ skillPresetId: value as string })}
          items={[{ value: ALL, label: 'All presets' }, ...presets.map(({ id, name }) => ({ value: id, label: name }))]}
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
        <InputSelectSmall
          name="period"
          ariaLabel="Period"
          className="ml-auto w-[180px] shrink-0"
          inputClassName="h-8"
          defaultValue={filters.range}
          onChange={(value) => set({ range: value })}
          items={RANGES.map(({ value, label }) => ({ value, label: `Last ${label}` }))}
        />
      </div>

      {isLoading || !usage ? (
        <Skeleton height={360} className="w-full" show />
      ) : (
        <div className={clsx('flex min-w-0 flex-col gap-8', isFetching && 'opacity-70')} aria-busy={isFetching}>
          <div className="flex min-w-0 flex-col gap-4">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Skill loads" value={usage.totals.loads.toLocaleString('en-US')} />
              <Stat label="Served from cache" value={percent(usage.totals.cached_loads, usage.totals.loads)} />
              <Stat label="Members" value={usage.totals.members.toLocaleString('en-US')} />
              <Stat
                label="Organization text sent"
                value={`${formatTokens(usage.totals.approx_injected_tokens)} tokens`}
              />
            </dl>

            <section
              aria-labelledby="usage-timeline"
              className="flex flex-col gap-4 rounded-md border border-neutral bg-surface-neutral p-4"
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
          </div>

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
            <section aria-labelledby="usage-skills" className="flex flex-col gap-2">
              <Heading level={2} id="usage-skills">
                Top 5 skills
              </Heading>
              <Table.Root className="w-full min-w-[600px]">
                <Table.Header className="[&_th]:font-sans [&_th]:text-xs">
                  <Table.Row>
                    <Table.ColumnHeaderCell>Skill</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="text-left">Loads</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="text-left">Cache</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="text-left">Members</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Last load</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {usage.by_skill.slice(0, TOP_LIMIT).map((row) => (
                    <Table.Row key={row.skill_name}>
                      <Table.Cell className="font-sans">
                        <DrillButton
                          label={row.skill_name}
                          active={filters.skillName === row.skill_name}
                          onClick={() =>
                            set({ skillName: filters.skillName === row.skill_name ? ALL : row.skill_name })
                          }
                        />
                      </Table.Cell>
                      <Table.Cell className="tabular-nums">{row.loads}</Table.Cell>
                      <Table.Cell className="tabular-nums">{percent(row.cached_loads, row.loads)}</Table.Cell>
                      <Table.Cell className="tabular-nums">{row.members}</Table.Cell>
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
                Top 5 members
              </Heading>
              <Table.Root className="w-full min-w-[600px]">
                <Table.Header className="[&_th]:font-sans [&_th]:text-xs">
                  <Table.Row>
                    <Table.ColumnHeaderCell>Member</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="text-left">Loads</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="text-left">Skills</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Last load</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {usage.by_member.slice(0, TOP_LIMIT).map((row) => (
                    <Table.Row key={row.user_sub}>
                      <Table.Cell>
                        <DrillButton
                          label={memberName(row.user_sub)}
                          active={filters.userSub === row.user_sub}
                          onClick={() => set({ userSub: filters.userSub === row.user_sub ? ALL : row.user_sub })}
                        />
                      </Table.Cell>
                      <Table.Cell className="tabular-nums">{row.loads}</Table.Cell>
                      <Table.Cell className="tabular-nums">{row.skills}</Table.Cell>
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
            <Table.Root className="w-full min-w-[480px]">
              <Table.Header className="[&_th]:font-sans [&_th]:text-xs">
                <Table.Row>
                  <Table.ColumnHeaderCell>Preset</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Loads</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Share of loads</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {byPreset.map((row) => (
                  <Table.Row key={row.skill_preset_id ?? NO_PRESET}>
                    <Table.Cell>
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
                    </Table.Cell>
                    <Table.Cell className="tabular-nums">{row.loads}</Table.Cell>
                    <Table.Cell className="tabular-nums">{percent(row.loads, usage.totals.loads)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </section>
        </div>
      )}
    </div>
  )
}

export function SkillPresetUsage() {
  const { organizationId = '' } = useParams({ strict: false })
  useDocumentTitle('Skill usage - Agents')
  return (
    <SkillPresetsLayout activeTab="usage">
      <UsageContent organizationId={organizationId} />
    </SkillPresetsLayout>
  )
}
