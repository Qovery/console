/*
 * Usage over a period the person picks: this month, last month, the last 3, 6 or 12 months, or a
 * custom range (24 months at most). A chart of one metric at a time (split by organization when
 * the contract has several and the person is a billing role), the totals for the period, the
 * table with the amounts invoiced per month (billing roles), and a CSV export of that table.
 * Reads GET /organization/{id}/usageHistory; members see quantities, never amounts.
 *
 *   <UsageHistory organizationId={id} client={client} />
 */
import type { UsageHistoryData as History } from 'qovery-pricing-typescript-axios'
import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts'
import type { PricingClient } from '@qovery/shared/billing/data-access'
import { Button, Chart, Icon, InputText } from '@qovery/shared/ui'
import { ChartTooltip } from './chart-tooltip'
import { CompactSelect } from './compact-select'
import { errorText } from './parts'
import { money, num } from './utils/format'
import { quantity } from './utils/format'
import {
  HISTORY_PRESETS,
  type HistoryPreset,
  customRangeError,
  granularityFor,
  historyCSV,
  historyTable,
  periodLabel,
  presetRange,
} from './utils/usage-rules'

// One color per organization, the console's chart palette.
const ORG_COLORS = [
  'var(--brand-9)',
  'var(--info-9)',
  'var(--positive-9)',
  'var(--warning-9)',
  'var(--accent-9, var(--neutral-9))',
  'var(--negative-9)',
]

const UNAVAILABLE: Record<string, string> = {
  aws_marketplace: 'Your invoices come from AWS Marketplace: see them in AWS.',
  not_linked: 'Billing is not set up for this organization yet.',
  billing_unavailable: 'Invoices could not be read right now. Try again in a minute.',
}

export function UsageHistory({
  organizationId,
  client,
  today = new Date(),
}: {
  organizationId: string
  client: PricingClient
  today?: Date
}) {
  const [preset, setPreset] = useState<HistoryPreset>('this_month')
  const [custom, setCustom] = useState(() => {
    const r = presetRange('last_3', today)
    return { from: r.from, to: r.to }
  })
  const [h, setH] = useState<History>()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [metric, setMetric] = useState('')
  const [scope, setScope] = useState('all')
  const rangeError = preset === 'custom' ? customRangeError(custom.from, custom.to, today) : ''
  const range = useMemo(
    () =>
      preset === 'custom'
        ? { ...custom, granularity: granularityFor(custom.from, custom.to) }
        : presetRange(preset, today),
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
  const series =
    h?.series.find((s) => s.sku === metric) ?? h?.series.find((s) => s.sku === 'deploy.minutes') ?? h?.series[0]
  const orgs = h?.organizations ?? []
  const split = orgs.length > 1
  const table = h ? historyTable(h, scope) : undefined
  const amounts = h?.amounts
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
    <section className="rounded border border-neutral bg-surface-neutral p-5" aria-label="Usage history">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-medium text-neutral">Usage history</h3>
          <p className="text-sm text-neutral-subtle">
            {split
              ? 'Every organization of your contract, or one of them.'
              : 'This organization, over the period you pick.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CompactSelect
            ariaLabel="Period"
            value={preset}
            onChange={(v) => setPreset(v as HistoryPreset)}
            options={HISTORY_PRESETS.map((p) => ({ value: p.id, label: p.label }))}
          />
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
          {h && h.series.length > 0 && (
            <CompactSelect
              ariaLabel="Metric"
              value={series?.sku ?? ''}
              onChange={setMetric}
              options={h.series.map((s) => ({ value: s.sku, label: s.name }))}
            />
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
          {h.series.length === 0 && (
            <p className="py-8 text-center text-sm text-neutral-subtle">No usage recorded in this period.</p>
          )}
          {series && (
            <>
              <div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
                {h.series.map((s, j) => (
                  <button
                    key={s.sku}
                    type="button"
                    onClick={() => setMetric(s.sku)}
                    className={`min-w-0 rounded border px-3 py-2 text-left transition-colors hover:bg-surface-neutral-subtle ${s.sku === series.sku ? 'border-brand-strong' : 'border-neutral'}`}
                  >
                    <div className="truncate text-sm text-neutral-subtle">
                      {s.name}
                      {s.aggregate === 'peak' ? ' (peak)' : ''}
                    </div>
                    <div className="text-sm font-medium text-neutral">
                      {table?.totals[j] == null ? 'No data' : quantity(table.totals[j] as number, s.unit)}
                    </div>
                  </button>
                ))}
                {scope === 'all' && amounts && !amounts.unavailable && (
                  <div className="rounded border border-neutral px-3 py-2">
                    <div className="text-sm text-neutral-subtle">Invoiced</div>
                    <div className="text-sm font-medium text-neutral">{money(amounts.total, amounts.currency)}</div>
                  </div>
                )}
              </div>
              <Chart.Container style={{ height: 240 }} isEmpty={!data.length}>
                <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid horizontal vertical={false} stroke="var(--neutral-4)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                  <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={(v: number) => num(v)} />
                  <Chart.Tooltip
                    content={
                      <ChartTooltip
                        title={series.name}
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
                      <span className="h-2 w-2 rounded-sm" style={{ background: ORG_COLORS[i % ORG_COLORS.length] }} />
                      {o.name}
                    </span>
                  ))}
                <span>
                  {series.aggregate === 'peak'
                    ? `The most in use on a day of each ${h.granularity}.`
                    : `Consumed per ${h.granularity}.`}
                </span>
              </div>
            </>
          )}
          {table && table.rows.length > 0 && h.series.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-medium text-neutral">Per {h.granularity}</h4>
                <Button size="sm" variant="outline" color="neutral" onClick={exportCSV}>
                  <Icon iconName="download" iconStyle="regular" />
                  Export CSV
                </Button>
              </div>
              <div className="max-h-[360px] overflow-auto rounded border border-neutral">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-surface-neutral">
                    <tr className="text-left text-sm text-neutral-subtle">
                      <th className="px-3 py-2 font-medium">{h.granularity === 'month' ? 'Month' : 'Day'}</th>
                      {table.columns.map((c) => (
                        <th key={c.sku} className="whitespace-nowrap px-3 py-2 text-right font-medium">
                          {c.label}
                          {c.aggregate === 'peak' ? ' (peak)' : ''}
                        </th>
                      ))}
                      {table.invoiced && (
                        <th className="whitespace-nowrap px-3 py-2 text-right font-medium">Invoiced</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral">
                    {table.rows.map((r) => (
                      <tr key={r.period}>
                        <td className="whitespace-nowrap px-3 py-1.5 text-neutral">{r.label}</td>
                        {r.cells.map((v, j) => (
                          <td
                            key={j}
                            className={`whitespace-nowrap px-3 py-1.5 text-right ${v == null ? 'text-neutral-subtle' : 'text-neutral'}`}
                          >
                            {v == null ? 'No data' : quantity(v, table.columns[j].unit)}
                          </td>
                        ))}
                        {table.invoiced && (
                          <td className="whitespace-nowrap px-3 py-1.5 text-right text-neutral">
                            {r.invoiced ? money(r.invoiced, table.invoiced.currency) : '—'}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-neutral">
                    <tr className="font-medium">
                      <td className="px-3 py-2 text-neutral">Total</td>
                      {table.totals.map((v, j) => (
                        <td key={j} className="whitespace-nowrap px-3 py-2 text-right text-neutral">
                          {v == null ? 'No data' : quantity(v, table.columns[j].unit)}
                        </td>
                      ))}
                      {table.invoiced && (
                        <td className="whitespace-nowrap px-3 py-2 text-right text-neutral">
                          {money(table.invoiced.total, table.invoiced.currency)}
                        </td>
                      )}
                    </tr>
                  </tfoot>
                </table>
              </div>
              <p className="mt-2 text-sm text-neutral-subtle">
                {amounts
                  ? amounts.unavailable
                    ? UNAVAILABLE[amounts.unavailable]
                    : h.granularity === 'month'
                      ? `Invoiced: what your invoices for the whole contract total each month, as on the Invoices page${scope === 'all' ? '' : ' (shown for all organizations only)'}.`
                      : `Invoiced in this period: ${money(amounts.total, amounts.currency)} for the whole contract. Pick months to see it per month.`
                  : 'Quantities only. Owners, Admins and Billing Managers also see the amounts invoiced.'}
                {split && scope === 'all' ? ' Counts are added across organizations on their busiest day.' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
