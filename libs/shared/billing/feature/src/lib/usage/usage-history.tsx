/*
 * Usage over a period the person picks: this month, last month, the last 3, 6 or 12 months, or a
 * custom range (24 months at most). A chart of one metric at a time (split by organization when
 * the contract has several and the person is a billing role), the totals for the period, the
 * table with the amounts invoiced per month (billing roles), and a CSV export of that table.
 * Reads GET /organization/{id}/usageHistory; members see quantities, never amounts.
 *
 *   <UsageHistory organizationId={id} client={client} />
 */
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts'
import type { UsageHistoryData as History, PricingClient } from '@qovery/shared/billing/data-access'
import { Button, Chart, Icon, InputText } from '@qovery/shared/ui'
import { ChartTooltip } from '../components/chart-tooltip'
import { CompactSelect } from '../components/compact-select'
import { errorText } from '../components/parts'
import { num } from '../utils/format'
import {
  HISTORY_PRESETS,
  type HistoryPreset,
  customRangeError,
  historyCSV,
  historyTable,
  periodLabel,
  presetRange,
  quantity,
} from '../utils/rules'

// One color per organization, the console's chart palette.
const ORG_COLORS = [
  'var(--brand-9)',
  'var(--info-9)',
  'var(--positive-9)',
  'var(--warning-9)',
  'var(--accent-9, var(--neutral-9))',
  'var(--negative-9)',
]

export function UsageHistory({
  organizationId,
  client,
  today = new Date(),
  embedded = false,
  renderDetails,
}: {
  organizationId: string
  client: PricingClient
  renderDetails?: (range: { from: string; to: string; granularity: 'month' }) => ReactNode
  embedded?: boolean
  today?: Date
}) {
  const [preset, setPreset] = useState<HistoryPreset>('last_3')
  const [custom, setCustom] = useState(() => {
    const r = presetRange('last_3', today)
    return { from: r.from, to: r.to }
  })
  const [h, setH] = useState<History>()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [metric, setMetric] = useState('')
  const [scope, setScope] = useState(organizationId)
  const rangeError = preset === 'custom' ? customRangeError(custom.from, custom.to, today) : ''
  const range = useMemo(
    () =>
      preset === 'custom'
        ? { ...custom, granularity: 'month' as const }
        : { ...presetRange(preset, today), granularity: 'month' as const },
    [preset, custom.from, custom.to]
  ) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!client.usageHistory || rangeError) {
      setLoading(false)
      setH(undefined)
      setError('')
      return
    }
    let live = true
    setLoading(true)
    setH(undefined)
    setError('')
    client
      .usageHistory(organizationId, range)
      .then((x) => {
        if (live) {
          setH(x)
          setError('')
        }
      })
      .catch((e) => live && setError(errorText(e)))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [client, organizationId, range.from, range.to, range.granularity, rangeError]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!client.usageHistory) return null
  const metrics =
    h?.series.filter((s) => s.kind === 'meter' && (s.unit === 'minutes' || s.source !== 'deployments')) ?? []
  const series = metrics.find((s) => s.sku === metric) ?? metrics.find((s) => s.sku === 'deploy.minutes') ?? metrics[0]
  const metricName = (s: History['series'][number]) => (s.sku === 'deploy.minutes' ? 'Build + deploy minutes' : s.name)
  const orgs = h?.organizations ?? []
  const split = orgs.length > 1
  const table = h ? historyTable(h, scope) : undefined
  const shownOrgs = scope === 'all' ? orgs : orgs.filter((o) => o.id === scope)
  const data = series
    ? series.points.map((p) => {
        const row: Record<string, string | number | null> = { label: periodLabel(p.period), fullTime: p.period }
        for (const o of shownOrgs) row[o.id] = p.no_data ? null : p.by_organization[o.id] ?? 0
        return row
      })
    : []
  const included =
    series?.included != null && (series.kind === 'limit' || h?.granularity === 'month') ? series.included : undefined

  function exportCSV() {
    if (!h) return
    const blob = new Blob([historyCSV(h, scope)], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `usage-${organizationId}-${h.from}-${h.to}${scope === 'all' ? '' : `-${scope}`}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }

  return (
    <>
      <section
        className={embedded ? 'p-4' : 'rounded border border-neutral bg-surface-neutral p-4'}
        aria-label="Usage history"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {h && series && (
            <p className="text-sm font-medium">
              {metricName(series)}: {quantity(table?.totals[h.series.indexOf(series)] ?? 0, series.unit)}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {split && (
              <CompactSelect
                ariaLabel="Organization"
                value={scope}
                onChange={setScope}
                options={[
                  { value: 'all', label: 'All organizations' },
                  ...orgs.map((o) => ({ value: o.id, label: o.name })),
                ]}
              />
            )}
            <CompactSelect
              ariaLabel="Period"
              value={preset}
              onChange={(v) => setPreset(v as HistoryPreset)}
              options={HISTORY_PRESETS.map((p) => ({ value: p.id, label: p.label }))}
            />
            {h && metrics.length > 1 && (
              <CompactSelect
                ariaLabel="Metric"
                value={series?.sku ?? ''}
                onChange={setMetric}
                options={metrics.map((s) => ({ value: s.sku, label: metricName(s) }))}
              />
            )}
            {h && series && (
              <Button size="sm" variant="outline" color="neutral" onClick={exportCSV}>
                <Icon iconName="download" iconStyle="regular" />
                Export CSV
              </Button>
            )}
          </div>
        </div>
        {preset === 'custom' && (
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[200px_200px_1fr]">
            <InputText
              name="history_from"
              label="From"
              type="date"
              value={custom.from}
              onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))}
            />
            <InputText
              name="history_to"
              label="To"
              type="date"
              value={custom.to}
              onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))}
            />
            <p className="self-center text-sm text-neutral-subtle">{rangeError || 'Up to 24 months.'}</p>
          </div>
        )}
        {error && (
          <p role="alert" className="mb-3 text-sm text-negative">
            {error}
          </p>
        )}
        {!h && !error && (
          <div className="h-[260px] animate-pulse rounded bg-surface-neutral-subtle" aria-label="Loading" />
        )}
        {h && (
          <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            {h.notes
              .filter((n) => n.startsWith('No data before') || n.startsWith('No usage'))
              .map((n) => (
                <p key={n} className="mb-3 text-sm text-neutral-subtle">
                  <Icon iconName="circle-info" iconStyle="regular" className="mr-1" />
                  {n.replace(/(\d{4}-\d{2}-\d{2})/, (d) => periodLabel(d, true))}
                </p>
              ))}
            {metrics.length === 0 && (
              <p className="py-8 text-center text-sm text-neutral-subtle">No usage recorded in this period.</p>
            )}
            {series && (
              <>
                <Chart.Container style={{ height: 240 }} isEmpty={!data.length}>
                  <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid horizontal vertical={false} stroke="var(--neutral-4)" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                    <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={(v: number) => num(v)} />
                    <Chart.Tooltip
                      cursor={{ fill: 'var(--neutral-2)' }}
                      content={
                        <ChartTooltip
                          title={metricName(series)}
                          formatLabel={(k) => orgs.find((o) => o.id === k)?.name ?? k}
                          formatValue={(v) => quantity(Number(v), series.unit)}
                        />
                      }
                    />
                    {included != null && (
                      <ReferenceLine
                        y={included}
                        stroke="var(--warning-9)"
                        strokeDasharray="4 4"
                        label={{
                          value: `Included: ${num(included)}${series.kind === 'meter' ? ' / month' : ''}`,
                          position: 'insideTopLeft',
                          fontSize: 11,
                          fill: 'var(--neutral-11)',
                        }}
                      />
                    )}
                    {shownOrgs.map((o, i) => (
                      <Bar
                        key={o.id}
                        dataKey={o.id}
                        name={o.id}
                        stackId="o"
                        fill={ORG_COLORS[i % ORG_COLORS.length]}
                        isAnimationActive={false}
                      />
                    ))}
                  </BarChart>
                </Chart.Container>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-neutral-subtle">
                  {split &&
                    shownOrgs.map((o, i) => (
                      <span key={o.id} className="inline-flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-sm"
                          style={{ background: ORG_COLORS[i % ORG_COLORS.length] }}
                        />
                        {o.name}
                      </span>
                    ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>
      {!rangeError && renderDetails?.(range)}
    </>
  )
}
