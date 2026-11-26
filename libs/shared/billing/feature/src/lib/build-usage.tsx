/*
 * Build usage over a period: build minutes by builder size (a bigger builder counts more per
 * minute), build against deploy time, the trend per day or month, what to optimize, then each
 * service (builds, minutes, average and p95 build time, builders used, cost, share, trend) with a
 * drill into its builds. Reads GET /organization/{id}/buildUsage; members see minutes, billing
 * roles also the costs. The back office passes its own `load` (staff endpoints, every field).
 *
 *   <BuildUsage organizationId={id} client={client} />
 */
import type { BuildServiceUsage, BuildUsageData, Granularity } from 'qovery-pricing-typescript-axios'
import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { PricingClient } from '@qovery/shared/billing/data-access'
import { Badge, Chart, Icon, InputText, Modal } from '@qovery/shared/ui'
import { ChartTooltip } from './chart-tooltip'
import { CompactSelect } from './compact-select'
import { errorText } from './parts'
import { money, num } from './utils/format'
import {
  BUILD_PRESETS,
  type BuildPreset,
  type BuildServiceFilter,
  type BuildSortKey,
  buildDuration,
  buildRange,
  buildServiceRows,
  buildSizeColor,
  customRangeError,
  granularityFor,
  periodLabel,
  quantity,
} from './utils/rules'

export type BuildUsageLoader = (range: {
  from: string
  to: string
  granularity?: Granularity
  service?: string
}) => Promise<BuildUsageData>

export interface BuildUsageProps {
  organizationId: string
  client?: PricingClient
  /** Reads from another source (the back office's staff endpoints). */
  load?: BuildUsageLoader
  /** Staff wording and the organization column for an account's several organizations. */
  staff?: boolean
  today?: Date
}

const DEPLOY_COLOR = 'var(--info-9)'
const BUILD_COLOR = 'var(--brand-9)'

function HintIcon({ kind }: { kind: string }) {
  const cls = `mt-0.5 ${kind === 'failed' ? 'text-negative' : 'text-brand'}`
  switch (kind) {
    case 'top_cost':
      return <Icon iconName="chart-pie" iconStyle="regular" className={cls} />
    case 'downsize':
      return <Icon iconName="arrow-down-short-wide" iconStyle="regular" className={cls} />
    case 'frequent':
      return <Icon iconName="repeat" iconStyle="regular" className={cls} />
    case 'failed':
      return <Icon iconName="triangle-exclamation" iconStyle="regular" className={cls} />
  }
  return <Icon iconName="lightbulb" iconStyle="regular" className={cls} />
}

function Tile({ label, value, hint }: { label: string; value: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="rounded border border-neutral px-3 py-2">
      <div className="truncate text-sm text-neutral-subtle">{label}</div>
      <div className="text-sm font-medium text-neutral">{value}</div>
      {hint && <div className="truncate text-sm text-neutral-subtle">{hint}</div>}
    </div>
  )
}

function Sparkline({ values, color = BUILD_COLOR }: { values: number[]; color?: string }) {
  const w = 84,
    h = 22
  const top = Math.max(...values, 0)
  if (!values.length || top === 0) return <span className="text-sm text-neutral-subtle">—</span>
  const step = values.length > 1 ? w / (values.length - 1) : w
  const pts = values.map((v, i) => `${(i * step).toFixed(1)},${(h - 2 - (v / top) * (h - 4)).toFixed(1)}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  )
}

const minutes = (n: number) => quantity(n >= 100 ? Math.round(n) : Math.round(n * 10) / 10, 'minutes')
const pct = (x: number) => `${Math.round(x * 100)}%`
const when = (iso: string) =>
  `${new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })} UTC`

type BuildSort = { key: BuildSortKey; desc: boolean }

function BuildTableHeader({
  k,
  children,
  right,
  sort,
  sortBy,
}: {
  k?: BuildSortKey
  children: React.ReactNode
  right?: boolean
  sort?: BuildSort
  sortBy?: (key: BuildSortKey) => void
}) {
  return (
    <th className={`whitespace-nowrap px-3 py-2 font-medium ${right ? 'text-right' : ''}`}>
      {k && sort && sortBy ? (
        <button type="button" className="inline-flex items-center gap-1 hover:text-neutral" onClick={() => sortBy(k)}>
          {children}
          {sort.key === k && <Icon iconName={sort.desc ? 'arrow-down' : 'arrow-up'} className="text-xs" />}
        </button>
      ) : (
        children
      )}
    </th>
  )
}

export function BuildUsage({ organizationId, client, load, staff, today = new Date() }: BuildUsageProps) {
  const loader = useMemo<BuildUsageLoader | undefined>(
    () => load ?? (client?.buildUsage ? (r) => client.buildUsage!(organizationId, r) : undefined),
    [load, client, organizationId]
  )
  const [preset, setPreset] = useState<BuildPreset>('last_30')
  const [custom, setCustom] = useState(() => {
    const r = buildRange('last_3', today)
    return { from: r.from, to: r.to }
  })
  const [d, setD] = useState<BuildUsageData>()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [chart, setChart] = useState<'size' | 'split' | 'cost'>('size')
  const [filter, setFilter] = useState<BuildServiceFilter>({ q: '', type: '', size: '', built: 'all' })
  const [sort, setSort] = useState<BuildSort>({ key: 'counted_build_minutes', desc: true })
  const [drill, setDrill] = useState<BuildServiceUsage>()
  const rangeError = preset === 'custom' ? customRangeError(custom.from, custom.to, today) : ''
  const range = useMemo(
    () =>
      preset === 'custom'
        ? { ...custom, granularity: granularityFor(custom.from, custom.to) }
        : buildRange(preset, today),
    [preset, custom.from, custom.to]
  ) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loader || rangeError) return
    let live = true
    setLoading(true)
    loader(range)
      .then((x) => {
        if (live) {
          setD(x)
          setError('')
        }
      })
      .catch((e) => live && setError(errorText(e)))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [organizationId, range.from, range.to, range.granularity, rangeError, load, client]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!loader) return null
  const amounts = !!d?.prices
  const cur = d?.currency ?? 'USD'
  const catalog = (d?.builder_sizes ?? []).map((s) => s.code)
  const sizeName = (code: string) =>
    d?.by_size.find((s) => s.size === code)?.name ?? d?.builder_sizes.find((s) => s.code === code)?.name ?? code
  const t = d?.totals
  const types = [...new Set((d?.services ?? []).map((s) => s.type).filter(Boolean))].sort()
  const rows = d ? buildServiceRows([...d.services], filter, sort) : []
  const multiOrg = staff && d?.organizations && Object.keys(d.organizations).length > 1
  const sortBy = (key: BuildSortKey) =>
    setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: key !== 'name' }))
  const data = (d?.periods ?? []).map((p) => ({
    label: periodLabel(p.period),
    fullTime: p.period,
    ...p.by_size,
    build: p.counted_build_minutes,
    deploy: p.deploy_minutes,
    cost: (p.cost ?? 0) / 100,
  }))
  const sizesInPeriod = (d?.by_size ?? []).map((s) => s.size)
  const buildShare =
    t && t.counted_build_minutes + t.deploy_minutes > 0
      ? t.counted_build_minutes / (t.counted_build_minutes + t.deploy_minutes)
      : 0

  return (
    <section className="rounded border border-neutral bg-surface-neutral p-5" aria-label="Build usage">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-medium text-neutral">Build usage</h3>
          <p className="text-sm text-neutral-subtle">
            {staff
              ? 'Each build from core, with the builder it ran on.'
              : 'Your builds, the builder each one ran on, and where to save.'}{' '}
            A minute on a bigger builder counts its size's multiplier.
          </p>
        </div>
        <CompactSelect
          ariaLabel="Period"
          value={preset}
          onChange={(v) => setPreset(v as BuildPreset)}
          options={BUILD_PRESETS.map((p) => ({ value: p.id, label: p.label }))}
        />
      </div>
      {preset === 'custom' && (
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[200px_200px_1fr]">
          <InputText
            name="builds_from"
            label="From"
            type="date"
            value={custom.from}
            onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))}
          />
          <InputText
            name="builds_to"
            label="To"
            type="date"
            value={custom.to}
            onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))}
          />
          <p className="self-center text-sm text-neutral-subtle">
            {rangeError || '24 months at most. Day by day up to three months, month by month beyond.'}
          </p>
        </div>
      )}
      {error && (
        <p role="alert" className="mb-3 text-sm text-negative">
          {error}
        </p>
      )}
      {!d && !error && (
        <div className="h-[320px] animate-pulse rounded bg-surface-neutral-subtle" aria-label="Loading" />
      )}
      {d && t && (
        <div className={`flex flex-col gap-5 ${loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}`}>
          <p className="text-sm text-neutral-subtle">
            <Icon iconName={d.source.complete ? 'circle-check' : 'circle-info'} iconStyle="regular" className="mr-1" />
            {d.source.note}
          </p>
          {t.deployments === 0 && t.builds === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-subtle">
              No build or deployment reported in this period.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
                <Tile
                  label="Build minutes"
                  value={minutes(t.counted_build_minutes)}
                  hint={`${num(t.build_minutes)} min run`}
                />
                {amounts && (
                  <Tile
                    label="Build cost"
                    value={money(t.build_cost ?? 0, cur)}
                    hint={`${money(d.prices!.build_per_minute, cur)} a standard minute`}
                  />
                )}
                <Tile
                  label="Deploy minutes"
                  value={minutes(t.deploy_minutes)}
                  hint={amounts ? money(t.deploy_cost ?? 0, cur) : 'rolling out, health checks'}
                />
                <Tile
                  label="Build / deploy"
                  value={`${pct(buildShare)} / ${pct(1 - buildShare)}`}
                  hint="of the minutes counted"
                />
                <Tile
                  label="Builds"
                  value={num(t.builds)}
                  hint={
                    t.failed_builds
                      ? `${num(t.failed_builds)} failed, ${minutes(t.failed_counted_minutes)}`
                      : 'none failed'
                  }
                />
                <Tile
                  label="Services"
                  value={`${t.services_built} built of ${t.services}`}
                  hint={`${t.services_not_built} deploy only`}
                />
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-medium text-neutral">Per {d.granularity}</h4>
                  <CompactSelect
                    ariaLabel="Chart"
                    value={chart}
                    onChange={(v) => setChart(v as typeof chart)}
                    options={[
                      { value: 'size', label: 'Build minutes by builder size' },
                      { value: 'split', label: 'Build and deploy minutes' },
                      ...(amounts ? [{ value: 'cost', label: 'Cost' }] : []),
                    ]}
                  />
                </div>
                <Chart.Container style={{ height: 240 }} isEmpty={!data.length}>
                  <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid horizontal vertical={false} stroke="var(--neutral-4)" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={56}
                      tickFormatter={(v: number) => (chart === 'cost' ? money(v * 100, cur) : num(v))}
                    />
                    <Chart.Tooltip
                      content={
                        <ChartTooltip
                          title={chart === 'cost' ? 'Cost' : 'Minutes'}
                          formatLabel={(k) =>
                            k === 'build'
                              ? 'Build'
                              : k === 'deploy'
                                ? 'Deploy'
                                : k === 'cost'
                                  ? 'Build and deploy'
                                  : sizeName(k)
                          }
                          formatValue={(v) => (chart === 'cost' ? money(Number(v) * 100, cur) : minutes(Number(v)))}
                        />
                      }
                    />
                    {chart === 'size' &&
                      sizesInPeriod.map((s) => (
                        <Bar
                          key={s}
                          dataKey={s}
                          name={s}
                          stackId="b"
                          fill={buildSizeColor(s, catalog)}
                          isAnimationActive={false}
                        />
                      ))}
                    {chart === 'split' && (
                      <>
                        <Bar dataKey="build" name="build" stackId="s" fill={BUILD_COLOR} isAnimationActive={false} />
                        <Bar dataKey="deploy" name="deploy" stackId="s" fill={DEPLOY_COLOR} isAnimationActive={false} />
                      </>
                    )}
                    {chart === 'cost' && (
                      <Bar dataKey="cost" name="cost" fill={BUILD_COLOR} isAnimationActive={false} />
                    )}
                  </BarChart>
                </Chart.Container>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-neutral-subtle">
                  {chart === 'size' &&
                    d.by_size.map((s) => (
                      <span key={s.size} className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-sm" style={{ background: buildSizeColor(s.size, catalog) }} />
                        {s.name}
                      </span>
                    ))}
                  {chart === 'split' && (
                    <>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-sm" style={{ background: BUILD_COLOR }} />
                        Build (counted)
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-sm" style={{ background: DEPLOY_COLOR }} />
                        Deploy
                      </span>
                    </>
                  )}
                  {chart === 'cost' && <span>Build and deploy minutes at your plan's price beyond the plan.</span>}
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-neutral">By builder size</h4>
                  <div className="overflow-auto rounded border border-neutral">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-sm text-neutral-subtle">
                          <th className="px-3 py-2 font-medium">Builder</th>
                          <th className="px-3 py-2 text-right font-medium">Builds</th>
                          <th className="px-3 py-2 text-right font-medium">Run</th>
                          <th className="px-3 py-2 text-right font-medium">Counted</th>
                          {amounts && <th className="px-3 py-2 text-right font-medium">Cost</th>}
                          <th className="px-3 py-2 font-medium">Share</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral">
                        {d.by_size.map((s) => (
                          <tr key={s.size}>
                            <td className="whitespace-nowrap px-3 py-1.5 text-neutral">
                              <span
                                className="mr-2 inline-block h-2 w-2 rounded-sm"
                                style={{ background: buildSizeColor(s.size, catalog) }}
                              />
                              {s.name}
                              <span className="ml-1 text-sm text-neutral-subtle">×{s.multiplier}</span>
                              {(s.unknown || s.no_builder) && (
                                <span className="ml-2 text-sm text-neutral-subtle">
                                  {s.unknown ? 'counted as Standard' : 'counts once'}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-1.5 text-right text-neutral">{num(s.builds)}</td>
                            <td className="whitespace-nowrap px-3 py-1.5 text-right text-neutral-subtle">
                              {num(s.build_minutes)} min
                            </td>
                            <td className="whitespace-nowrap px-3 py-1.5 text-right text-neutral">
                              {num(s.counted_build_minutes)} min
                            </td>
                            {amounts && (
                              <td className="whitespace-nowrap px-3 py-1.5 text-right text-neutral">
                                {money(s.cost ?? 0, cur)}
                              </td>
                            )}
                            <td className="w-28 px-3 py-1.5">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-neutral-component">
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: pct(s.share), background: buildSizeColor(s.size, catalog) }}
                                  />
                                </div>
                                <span className="w-8 text-right text-sm text-neutral-subtle">{pct(s.share)}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-neutral">What to optimize</h4>
                  {d.hints.length === 0 ? (
                    <p className="rounded border border-neutral px-3 py-4 text-sm text-neutral-subtle">
                      Nothing stands out in this period.
                    </p>
                  ) : (
                    <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                      {d.hints.slice(0, 6).map((h, i) => (
                        <li key={i} className="flex gap-3 rounded border border-neutral px-3 py-2">
                          <HintIcon kind={h.kind} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                              <button
                                type="button"
                                className="text-left text-sm font-medium text-neutral hover:underline"
                                onClick={() => setDrill(d.services.find((s) => s.service_id === h.service_id))}
                              >
                                {h.title}
                              </button>
                              <span className="whitespace-nowrap text-sm text-neutral-subtle">
                                {h.kind === 'downsize' ? 'save ' : ''}
                                {minutes(h.minutes)}
                                {amounts && h.cost ? `, ${money(h.cost, cur)}` : ''}
                              </span>
                            </div>
                            <p className="text-sm text-neutral-subtle">{h.detail}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-medium text-neutral">
                    Services{' '}
                    <span className="font-normal text-neutral-subtle">
                      {t.services_built} built, {t.services_not_built} deploy only
                    </span>
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      aria-label="Search services"
                      placeholder="Search a service"
                      value={filter.q}
                      onChange={(e) => setFilter((f) => ({ ...f, q: e.target.value }))}
                      className="h-8 w-48 rounded border border-neutral bg-surface-neutral px-3 text-sm text-neutral placeholder:text-neutral-subtle focus:border-brand-strong focus:outline-none"
                    />
                    <CompactSelect
                      ariaLabel="Type"
                      value={filter.type}
                      onChange={(type) => setFilter((f) => ({ ...f, type }))}
                      options={[
                        { value: '', label: 'All types' },
                        ...types.map((x) => ({ value: x, label: x.charAt(0) + x.slice(1).toLowerCase() })),
                      ]}
                    />
                    <CompactSelect
                      ariaLabel="Builder"
                      value={filter.size}
                      onChange={(size) => setFilter((f) => ({ ...f, size }))}
                      options={[
                        { value: '', label: 'All builders' },
                        ...d.by_size.map((s) => ({ value: s.size, label: s.name })),
                      ]}
                    />
                    <CompactSelect
                      ariaLabel="Built"
                      value={filter.built}
                      onChange={(b) => setFilter((f) => ({ ...f, built: b as BuildServiceFilter['built'] }))}
                      options={[
                        { value: 'all', label: 'Built and not' },
                        { value: 'built', label: 'Built' },
                        { value: 'not_built', label: 'Deploy only' },
                      ]}
                    />
                  </div>
                </div>
                <div className="overflow-auto rounded border border-neutral">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-neutral">
                      <tr className="text-left text-sm text-neutral-subtle">
                        <BuildTableHeader sort={sort} sortBy={sortBy} k="name">
                          Service
                        </BuildTableHeader>
                        {multiOrg && <BuildTableHeader>Organization</BuildTableHeader>}
                        <BuildTableHeader sort={sort} sortBy={sortBy} k="builds" right>
                          Builds
                        </BuildTableHeader>
                        <BuildTableHeader sort={sort} sortBy={sortBy} k="counted_build_minutes" right>
                          Build min
                        </BuildTableHeader>
                        <BuildTableHeader sort={sort} sortBy={sortBy} k="deploy_minutes" right>
                          Deploy min
                        </BuildTableHeader>
                        <BuildTableHeader sort={sort} sortBy={sortBy} k="avg_build_seconds" right>
                          Avg build
                        </BuildTableHeader>
                        <BuildTableHeader sort={sort} sortBy={sortBy} k="p95_build_seconds" right>
                          p95 build
                        </BuildTableHeader>
                        <BuildTableHeader>Builder</BuildTableHeader>
                        {amounts && (
                          <BuildTableHeader sort={sort} sortBy={sortBy} k="cost" right>
                            Cost
                          </BuildTableHeader>
                        )}
                        <BuildTableHeader sort={sort} sortBy={sortBy} k="share" right>
                          Share
                        </BuildTableHeader>
                        <BuildTableHeader>Trend</BuildTableHeader>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral">
                      {rows.length === 0 && (
                        <tr>
                          <td colSpan={11} className="px-3 py-6 text-center text-sm text-neutral-subtle">
                            No service matches.
                          </td>
                        </tr>
                      )}
                      {rows.map((s) => (
                        <tr
                          key={s.organization_id + s.service_id}
                          className="cursor-pointer hover:bg-surface-neutral-subtle"
                          onClick={() => setDrill(s)}
                        >
                          <td className="max-w-[240px] px-3 py-1.5">
                            <div
                              className={`truncate font-medium ${s.service_id ? 'text-neutral' : 'text-neutral-subtle'}`}
                            >
                              {s.name}
                            </div>
                            <div className="text-sm text-neutral-subtle">
                              {s.type
                                ? s.type.charAt(0) + s.type.slice(1).toLowerCase()
                                : 'Time no service accounts for'}
                              {s.failed_builds ? ` · ${s.failed_builds} failed` : ''}
                            </div>
                          </td>
                          {multiOrg && (
                            <td className="whitespace-nowrap px-3 py-1.5 text-neutral-subtle">
                              {d.organizations?.[s.organization_id] ?? s.organization_id}
                            </td>
                          )}
                          <td className="px-3 py-1.5 text-right text-neutral">{s.builds ? num(s.builds) : '—'}</td>
                          <td className="whitespace-nowrap px-3 py-1.5 text-right text-neutral">
                            {s.builds ? num(s.counted_build_minutes) : '—'}
                            {s.builds > 0 && s.counted_build_minutes !== s.build_minutes && (
                              <div className="text-sm text-neutral-subtle">{num(s.build_minutes)} run</div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-1.5 text-right text-neutral">
                            {num(s.deploy_minutes)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-1.5 text-right text-neutral">
                            {s.builds ? buildDuration(s.avg_build_seconds) : '—'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-1.5 text-right text-neutral">
                            {s.builds ? buildDuration(s.p95_build_seconds) : '—'}
                          </td>
                          <td className="px-3 py-1.5">
                            <div className="flex flex-wrap gap-1">
                              {s.sizes.map((z) => (
                                <Badge className="font-medium" key={z} color="neutral" variant="surface" size="sm">
                                  <span
                                    className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                                    style={{ background: buildSizeColor(z, catalog) }}
                                  />
                                  {sizeName(z)}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          {amounts && (
                            <td className="whitespace-nowrap px-3 py-1.5 text-right text-neutral">
                              {money(s.cost ?? 0, cur)}
                            </td>
                          )}
                          <td className="whitespace-nowrap px-3 py-1.5 text-right text-neutral-subtle">
                            {s.builds ? pct(s.share) : '—'}
                          </td>
                          <td className="px-3 py-1.5">
                            <Sparkline values={s.trend} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          {d.notes.length > 0 && <p className="text-sm text-neutral-subtle">{d.notes.join(' ')}</p>}
        </div>
      )}
      {drill && d && !rangeError && (
        <BuildDrill
          service={d.services.find((service) => service.service_id === drill.service_id) ?? drill}
          load={loader}
          range={range}
          data={d}
          amounts={amounts}
          onClose={() => setDrill(undefined)}
        />
      )}
    </section>
  )
}

function BuildDrill({
  service,
  load,
  range,
  data,
  amounts,
  onClose,
}: {
  service: BuildServiceUsage
  load: BuildUsageLoader
  range: { from: string; to: string; granularity: Granularity }
  data: BuildUsageData
  amounts: boolean
  onClose: () => void
}) {
  const [rows, setRows] = useState<BuildUsageData['builds']>()
  const [error, setError] = useState('')
  useEffect(() => {
    let live = true
    setRows(undefined)
    setError('')
    load({ ...range, service: service.service_id })
      .then((x) => live && setRows(x.builds ?? []))
      .catch((e) => live && setError(errorText(e)))
    return () => {
      live = false
    }
  }, [load, range, service.service_id])
  const cur = data.currency
  const catalog = data.builder_sizes.map((s) => s.code)
  return (
    <Modal
      externalOpen
      setExternalOpen={(o) => {
        if (!o) onClose()
      }}
      width="min(980px, calc(100vw - 24px))"
    >
      <div className="p-6">
        <h2 className="h4 text-neutral">{service.name}</h2>
        <p className="mb-4 text-sm text-neutral-subtle">
          {periodLabel(range.from, true)} to {periodLabel(range.to, true)} · {num(service.builds)} builds,{' '}
          {minutes(service.counted_build_minutes)} counted
          {amounts && service.cost != null ? `, ${money(service.cost, cur)}` : ''}
          {service.builds ? ` · p95 ${buildDuration(service.p95_build_seconds)}` : ''}
        </p>
        {error && (
          <p role="alert" className="text-sm text-negative">
            {error}
          </p>
        )}
        {!rows && !error && (
          <div className="h-40 animate-pulse rounded bg-surface-neutral-subtle" aria-label="Loading" />
        )}
        {rows && (
          <div className="max-h-[60vh] overflow-auto rounded border border-neutral">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-neutral">
                <tr className="text-left text-sm text-neutral-subtle">
                  <th className="px-3 py-2 font-medium">Finished</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 text-right font-medium">Build</th>
                  <th className="px-3 py-2 text-right font-medium">Deploy</th>
                  <th className="px-3 py-2 font-medium">Builder</th>
                  <th className="px-3 py-2 text-right font-medium">Counted</th>
                  {amounts && <th className="px-3 py-2 text-right font-medium">Cost</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral">
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-neutral-subtle">
                      No build in this period.
                    </td>
                  </tr>
                )}
                {rows.map((b) => (
                  <tr key={b.execution_id}>
                    <td className="whitespace-nowrap px-3 py-1.5 text-neutral">{when(b.finished_at)}</td>
                    <td className="px-3 py-1.5">
                      <Badge className="font-medium" color={b.failed ? 'red' : 'green'} variant="surface" size="sm">
                        {b.failed ? 'Failed' : 'Succeeded'}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-3 py-1.5 text-right text-neutral">
                      {b.build_seconds ? buildDuration(b.build_seconds) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-1.5 text-right text-neutral-subtle">
                      {b.deploy_seconds ? buildDuration(b.deploy_seconds) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-1.5 text-neutral">
                      <span
                        className="mr-1.5 inline-block h-2 w-2 rounded-sm"
                        style={{ background: buildSizeColor(b.size, catalog) }}
                      />
                      {b.size_name}
                      {b.cpu_milli != null && (
                        <span className="ml-1 text-sm text-neutral-subtle">
                          {b.cpu_milli / 1000} vCPU{b.ram_gib != null ? `, ${b.ram_gib} GiB` : ''}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-1.5 text-right text-neutral">
                      {b.build_seconds ? `${b.counted_build_minutes} min` : '—'}
                    </td>
                    {amounts && (
                      <td className="whitespace-nowrap px-3 py-1.5 text-right text-neutral">
                        {money(b.cost ?? 0, cur)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {rows && rows.length >= 500 && (
          <p className="mt-2 text-sm text-neutral-subtle">
            The latest 500 builds. Pick a shorter period to see the others.
          </p>
        )}
      </div>
    </Modal>
  )
}
