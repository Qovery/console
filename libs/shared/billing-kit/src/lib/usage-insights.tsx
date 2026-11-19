/*
 * Usage over time, the part of the billing page that explains the bill: what the plan's
 * allowances are worth at list price, each SKU day by day over three months against its
 * allowance, deployment minutes per month, and where each meter ends the month at today's pace.
 * Everything comes from billingUsage.usage_insights; amounts only reach billing roles.
 *
 *   <UsageInsights usage={billingUsage} />           the whole section
 *   <UsageChart series={s} amounts />                 one SKU (the "View usage" modal)
 */
import { useMemo, useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts'
import { Chart, SegmentedControl } from '@qovery/shared/ui'
import { CompactSelect } from './compact-select'
import { money, num } from './format'
import type { BillingUsage, BuilderSize, DeploymentMonth, UsageProjection, UsageSeries, UsageValue } from './types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const dayLabel = (d: string) => `${MONTHS[Number(d.slice(5, 7)) - 1]} ${Number(d.slice(8))}`
const monthLabel = (m: string) => `${MONTHS[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`

function Panel({
  title,
  aside,
  children,
}: {
  title: React.ReactNode
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded border border-neutral bg-surface-neutral p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-neutral">{title}</h3>
        {aside}
      </div>
      {children}
    </div>
  )
}

// ------------------------------------------------------------------ one SKU over time

type Range = '30' | '90'
type MeterView = 'daily' | 'month'

/** One SKU over time. Limits: the count per day against the allowance. Meters: per day, or the
 *  month's running total against the monthly allowance. */
export function UsageChart({
  series,
  height = 220,
  defaultRange = '90',
}: {
  series: UsageSeries
  height?: number
  defaultRange?: Range
}) {
  const [range, setRange] = useState<Range>(defaultRange)
  const [view, setView] = useState<MeterView>('month')
  const meter = series.kind === 'meter'
  const data = useMemo(() => {
    const pts = series.points.slice(-Number(range))
    let month = '',
      total = 0
    // The running total starts from the month's first day even when the range starts later.
    for (const p of series.points.slice(0, series.points.length - pts.length)) {
      if (p.day.slice(0, 7) !== month) {
        month = p.day.slice(0, 7)
        total = 0
      }
      total += p.quantity
    }
    return pts.map((p) => {
      if (p.day.slice(0, 7) !== month) {
        month = p.day.slice(0, 7)
        total = 0
      }
      total += p.quantity
      return {
        label: dayLabel(p.day),
        fullTime: p.day,
        value: meter && view === 'month' ? Math.round(total) : Math.round(p.quantity * 10) / 10,
      }
    })
  }, [series, range, view, meter])
  const showAllowance = series.included != null && (!meter || view === 'month')
  const peak = Math.max(0, ...data.map((d) => d.value))
  const top = showAllowance ? Math.max(peak, series.included as number) * 1.1 : 'auto'
  const unit = series.unit || ''
  if (series.points.length < 2) {
    return (
      <div
        className="rounded border border-dashed border-neutral p-6 text-center text-sm text-neutral-subtle"
        style={{ minHeight: height / 2 }}
      >
        History starts today: {num(series.points[0]?.quantity ?? 0)} {unit} in use. The chart fills in day by day.
      </div>
    )
  }
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-end gap-2">
        {meter && (
          <SegmentedControl.Root value={view} onValueChange={(v) => setView(v as MeterView)}>
            <SegmentedControl.Item value="month">Month to date</SegmentedControl.Item>
            <SegmentedControl.Item value="daily">Per day</SegmentedControl.Item>
          </SegmentedControl.Root>
        )}
        <SegmentedControl.Root value={range} onValueChange={(v) => setRange(v as Range)}>
          <SegmentedControl.Item value="30">30 days</SegmentedControl.Item>
          <SegmentedControl.Item value="90">3 months</SegmentedControl.Item>
        </SegmentedControl.Root>
      </div>
      <Chart.Container style={{ height }} isEmpty={!data.length}>
        {meter && view === 'daily' ? (
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid horizontal vertical={false} stroke="var(--neutral-4)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={28} />
            <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={(v: number) => num(v)} />
            <Chart.Tooltip
              content={
                <Chart.TooltipContent
                  title={series.name}
                  formatLabel={() => 'Per day'}
                  formatValue={(v) => `${num(Number(v))} ${unit}`}
                />
              }
            />
            <Bar dataKey="value" name="value" fill="var(--brand-9)" isAnimationActive={false} />
          </BarChart>
        ) : (
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid horizontal vertical={false} stroke="var(--neutral-4)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={28} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={48}
              domain={[0, top]}
              allowDecimals={false}
              tickFormatter={(v: number) => num(v)}
            />
            <Chart.Tooltip
              content={
                <Chart.TooltipContent
                  title={series.name}
                  formatLabel={() => (meter ? 'Month to date' : 'In use')}
                  formatValue={(v) => `${num(Number(v))} ${unit}`}
                />
              }
            />
            {showAllowance && (
              <ReferenceLine
                y={series.included}
                stroke="var(--warning-9)"
                strokeDasharray="4 4"
                label={{
                  value: `Included: ${num(series.included as number)}${meter ? ' / month' : ''}`,
                  position: 'insideTopLeft',
                  fontSize: 11,
                  fill: 'var(--neutral-11)',
                }}
              />
            )}
            <Area
              type={meter ? 'monotone' : 'stepAfter'}
              dataKey="value"
              name="value"
              stroke="var(--brand-9)"
              fill="var(--brand-9)"
              fillOpacity={0.15}
              isAnimationActive={false}
            />
          </AreaChart>
        )}
      </Chart.Container>
    </div>
  )
}

// ------------------------------------------------------------------ the sections

function ValuePanel({ v }: { v: UsageValue }) {
  const cur = v.currency
  const ratio = v.monthly_fee > 0 ? v.included_value / v.monthly_fee : 0
  const max = Math.max(1, ...v.lines.map((l) => l.included_value))
  return (
    <Panel
      title="What your plan covers"
      aside={<span className="text-xs text-neutral-subtle">at list price, per month</span>}
    >
      <div className="mb-4 flex flex-wrap items-end gap-x-8 gap-y-2">
        <div>
          <div className="text-xs text-neutral-subtle">You pay</div>
          <div className="text-2xl font-medium text-neutral">
            {money(v.monthly_fee, cur)}
            <span className="text-sm font-normal text-neutral-subtle"> / month</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-neutral-subtle">Included at list price</div>
          <div className="text-2xl font-medium text-neutral">{money(v.included_value, cur)}</div>
        </div>
        <div>
          <div className="text-xs text-neutral-subtle">In use</div>
          <div className="text-2xl font-medium text-neutral">{money(v.used_value, cur)}</div>
        </div>
        {ratio >= 1.1 && <div className="pb-1 text-sm text-positive">{ratio.toFixed(1)}× what you pay</div>}
      </div>
      <div className="flex flex-col gap-3">
        {v.lines.map((l) => (
          // Phones: name, figures, then the bar, one under the other. Wider: name, bar, figures.
          <div
            key={l.sku}
            className="grid grid-cols-1 items-center gap-x-3 gap-y-1 text-sm sm:grid-cols-[minmax(120px,1fr)_2fr_auto]"
          >
            <div className="min-w-0 text-neutral">{l.name}</div>
            <div
              className="order-last h-2 overflow-hidden rounded-full bg-surface-neutral-component sm:order-none"
              title={`${num(Math.min(l.used, l.included))} of ${num(l.included)} ${l.unit} in use`}
            >
              <div
                className="relative h-full rounded-full bg-[var(--brand-4)]"
                style={{ width: `${(100 * l.included_value) / max}%` }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-[var(--brand-9)]"
                  style={{ width: `${l.included_value ? (100 * l.used_value) / l.included_value : 0}%` }}
                />
              </div>
            </div>
            <div className="text-xs text-neutral-subtle sm:whitespace-nowrap sm:text-right">
              {num(Math.min(l.used, l.included))} / {num(l.included)} {l.unit} × {money(l.unit_price, cur)} ={' '}
              <span className="text-neutral">{money(l.included_value, cur)}</span>
            </div>
          </div>
        ))}
      </div>
      {v.per_unit.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral pt-4">
          {v.per_unit.map((p) => (
            <div key={p.label} className="rounded border border-neutral px-3 py-2">
              <div className="text-sm font-medium text-neutral">{money(p.amount, cur)}</div>
              <div className="text-xs text-neutral-subtle">
                {p.label} ({num(p.count)}
                {p.sku === 'deploy.count' ? ' in 30 days' : ''})
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs text-neutral-subtle">
        Each allowance priced at what one more unit costs. Dark: in use. Light: included and still available.
      </p>
    </Panel>
  )
}

function ProjectionPanel({
  items,
  currency,
  amounts,
}: {
  items: UsageProjection[]
  currency: string
  amounts: boolean
}) {
  const shown = items.filter((p) => p.used > 0 || p.included)
  if (!shown.length) return null
  const d = shown[0]
  return (
    <Panel
      title="At this pace"
      aside={
        <span className="text-xs text-neutral-subtle">
          day {d.days_elapsed} of {d.days_in_month}
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {shown.map((p) => {
          const pct = p.included ? Math.round((100 * p.projected) / p.included) : null
          const tone =
            p.projected_over > 0 ? 'text-negative' : pct != null && pct >= 85 ? 'text-warning' : 'text-positive'
          return (
            <div key={p.sku} className="rounded border border-neutral p-4">
              <div className="mb-1 text-xs font-medium text-neutral-subtle">{p.name}</div>
              <div className="text-sm text-neutral">
                <span className="text-lg font-medium">{num(p.projected)}</span> {p.unit} by the end of the month
              </div>
              <div className="text-xs text-neutral-subtle">
                {num(p.used)} so far, about {num(p.daily_pace)} per day
                {p.included ? ` · ${num(p.included)} included` : ' · unlimited'}
              </div>
              <div className={`mt-2 text-xs font-medium ${tone}`}>
                {p.projected_over > 0 ? (
                  <>
                    {num(p.projected_over)} {p.unit} above the plan
                    {amounts && p.projected_cost != null ? `, about ${money(p.projected_cost, currency)}` : ''}
                  </>
                ) : pct != null ? (
                  `${pct}% of the allowance, nothing billed above the plan`
                ) : (
                  'Nothing billed above the plan'
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

function MonthsPanel({ months, currency, amounts }: { months: DeploymentMonth[]; currency: string; amounts: boolean }) {
  if (!months.length) return null
  const inc = months[months.length - 1]?.included
  const data = months.map((m) => ({
    label: monthLabel(m.month),
    fullTime: m.month,
    build: Math.round(m.build_minutes),
    deploy: Math.round(m.deploy_minutes),
  }))
  const top = Math.max(inc ?? 0, ...months.map((m) => m.minutes)) * 1.1
  return (
    <Panel
      title="Deployment minutes per month"
      aside={
        inc != null ? <span className="text-xs text-neutral-subtle">{num(inc)} included per month</span> : undefined
      }
    >
      <Chart.Container className="h-[200px]" isEmpty={false}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid horizontal vertical={false} stroke="var(--neutral-4)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={48} domain={[0, top]} tickFormatter={(v: number) => num(v)} />
          <Chart.Tooltip
            content={
              <Chart.TooltipContent
                title="Minutes"
                formatLabel={(k) => (k === 'build' ? 'Build' : 'Deploy')}
                formatValue={(v) => `${num(Number(v))} min`}
              />
            }
          />
          {inc != null && <ReferenceLine y={inc} stroke="var(--warning-9)" strokeDasharray="4 4" />}
          <Bar dataKey="build" name="build" stackId="m" fill="var(--brand-9)" isAnimationActive={false} />
          <Bar dataKey="deploy" name="deploy" stackId="m" fill="var(--info-9)" isAnimationActive={false} />
        </BarChart>
      </Chart.Container>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-neutral-subtle">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-[var(--brand-9)]" />
          Build
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-[var(--info-9)]" />
          Deploy
        </span>
        {inc != null && (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 border-t border-dashed border-[var(--warning-9)]" />
            Included per month
          </span>
        )}
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-neutral-subtle">
              <th className="py-1 pr-4 font-medium">Month</th>
              <th className="py-1 pr-4 text-right font-medium">Deployments</th>
              <th className="py-1 pr-4 text-right font-medium">Build</th>
              <th className="py-1 pr-4 text-right font-medium">Deploy</th>
              <th className="py-1 pr-4 text-right font-medium">Above the plan</th>
              {amounts && <th className="py-1 text-right font-medium">Billed</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral">
            {months.map((m, i) => (
              <tr key={m.month}>
                <td className="py-1.5 pr-4 text-neutral">
                  {monthLabel(m.month)}
                  {i === months.length - 1 ? <span className="text-xs text-neutral-subtle"> (so far)</span> : ''}
                </td>
                <td className="py-1.5 pr-4 text-right text-neutral">{num(m.deployments)}</td>
                <td className="py-1.5 pr-4 text-right text-neutral">
                  {num(m.build_minutes)} min
                  {m.build_billed_minutes != null && m.build_billed_minutes > m.build_minutes + 0.5 && (
                    <div className="text-xs text-neutral-subtle">
                      counts {num(m.build_billed_minutes)} (bigger builders)
                    </div>
                  )}
                </td>
                <td className="py-1.5 pr-4 text-right text-neutral">{num(m.deploy_minutes)} min</td>
                <td className={`py-1.5 pr-4 text-right ${m.over_minutes > 0 ? 'text-warning' : 'text-neutral-subtle'}`}>
                  {m.over_minutes > 0 ? `${num(m.over_minutes)} min` : 'none'}
                </td>
                {amounts && <td className="py-1.5 text-right text-neutral">{money(m.cost, currency)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

function HistoryPanel({
  series,
  pick,
  setPick,
}: {
  series: UsageSeries[]
  pick: string
  setPick: (s: string) => void
}) {
  const s = series.find((x) => x.sku === pick) ?? series[0]
  if (!s) return null
  const last = s.points[s.points.length - 1]?.quantity ?? 0
  const first = s.points.find((p) => p.quantity > 0)?.quantity ?? 0
  const change = s.kind === 'limit' && first > 0 ? Math.round((100 * (last - first)) / first) : null
  return (
    <Panel
      title="Usage over time"
      aside={
        <CompactSelect
          ariaLabel="SKU"
          value={s.sku}
          onChange={setPick}
          options={series.map((x) => ({ value: x.sku, label: x.name }))}
        />
      }
    >
      <div className="mb-1 text-xs text-neutral-subtle">
        {s.kind === 'meter'
          ? `Consumed by this organization${s.included != null ? `, against the ${num(s.included)} ${s.unit} included each month` : ''}.`
          : `${num(last)} ${s.unit} today${s.included != null ? ` of ${num(s.included)} included` : ''}${change != null && change !== 0 ? `, ${change > 0 ? '+' : ''}${change}% in three months` : ''}.`}
      </div>
      <UsageChart key={s.sku} series={s} />
    </Panel>
  )
}

/** The usage section of the billing page: value, projection, history and monthly totals. */
/** How build time counts by builder size: bigger builders use the plan's minutes faster and cost more per minute beyond it. */
function BuilderPanel({ sizes, currency, amounts }: { sizes: BuilderSize[]; currency: string; amounts: boolean }) {
  const priced = amounts && sizes.some((s) => s.price_per_minute)
  return (
    <Panel
      title="Build time by builder size"
      aside={<span className="text-xs text-neutral-subtle">deploy time always counts once</span>}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-neutral-subtle">
              <th className="py-1 pr-4 font-medium">Builder</th>
              <th className="hidden py-1 pr-4 font-medium sm:table-cell">Up to</th>
              <th className="py-1 pr-4 text-right font-medium">One build minute counts</th>
              {priced && <th className="py-1 text-right font-medium">Beyond the plan</th>}
              {priced && sizes.some((s) => s.prepaid_per_minute) && (
                <th className="hidden py-1 pl-4 text-right font-medium sm:table-cell">Prepaid yearly</th>
              )}
            </tr>
          </thead>
          <tbody>
            {sizes.map((s, i) => (
              <tr key={s.code} className="border-t border-neutral">
                <td className="py-1.5 pr-4 text-neutral">
                  {s.name}
                  {i === 0 && <span className="text-xs text-neutral-subtle"> (default)</span>}
                  {s.listed === false && <span className="text-xs text-neutral-subtle"> (on request)</span>}
                  <div className="text-xs text-neutral-subtle sm:hidden">
                    up to {num(s.max_cpu_milli / 1000)} vCPU, {num(s.max_ram_gib)} GiB
                  </div>
                </td>
                <td className="hidden whitespace-nowrap py-1.5 pr-4 text-neutral-subtle sm:table-cell">
                  {num(s.max_cpu_milli / 1000)} vCPU, {num(s.max_ram_gib)} GiB
                </td>
                <td className="whitespace-nowrap py-1.5 pr-4 text-right text-neutral">
                  {s.multiplier === 1 ? '1 min' : `${num(s.multiplier)} min`}
                </td>
                {priced && (
                  <td className="whitespace-nowrap py-1.5 text-right text-neutral">
                    {s.price_per_minute ? `${money(Math.round(s.price_per_minute), currency)}/min` : '—'}
                  </td>
                )}
                {priced && sizes.some((x) => x.prepaid_per_minute) && (
                  <td className="hidden whitespace-nowrap py-1.5 pl-4 text-right text-positive sm:table-cell">
                    {s.prepaid_per_minute ? `${money(Math.round(s.prepaid_per_minute), currency)}/min` : '—'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-neutral-subtle">
        The builder size is set per service (build CPU and RAM in the advanced settings). Larger builders use the plan's
        minutes faster; beyond the largest size, the count grows with CPU and RAM.
      </p>
    </Panel>
  )
}

export function UsageInsights({
  usage,
  pick,
  onPick,
}: {
  usage: BillingUsage
  pick?: string
  onPick?: (sku: string) => void
}) {
  const ins = usage.usage_insights
  const [own, setOwn] = useState('deploy.minutes')
  if (!ins) return null
  const amounts = usage.access !== 'member'
  const sel = pick ?? own
  const setSel = onPick ?? setOwn
  return (
    <div className="flex flex-col gap-4">
      {amounts && ins.value && ins.value.lines.length > 0 && <ValuePanel v={ins.value} />}
      <ProjectionPanel items={ins.projection} currency={usage.billing.currency} amounts={amounts} />
      <HistoryPanel series={ins.series} pick={sel} setPick={setSel} />
      <MonthsPanel months={ins.deployment_months} currency={usage.billing.currency} amounts={amounts} />
      {usage.builder_sizes && usage.builder_sizes.length > 1 && (
        <BuilderPanel sizes={usage.builder_sizes} currency={usage.billing.currency} amounts={amounts} />
      )}
    </div>
  )
}
