import type { BuildServiceUsage, Granularity, UsageHistoryData } from 'qovery-pricing-typescript-axios'

export type HistoryPreset = 'this_month' | 'last_month' | 'last_3' | 'last_6' | 'last_12' | 'custom'

export const HISTORY_PRESETS: { id: HistoryPreset; label: string }[] = [
  { id: 'this_month', label: 'This month' },
  { id: 'last_month', label: 'Last month' },
  { id: 'last_3', label: 'Last 3 months' },
  { id: 'last_6', label: 'Last 6 months' },
  { id: 'last_12', label: 'Last 12 months' },
  { id: 'custom', label: 'Custom range' },
]

const ymd = (d: Date) => d.toISOString().slice(0, 10)

const utcDay = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d))

/** Day by day up to three months, month by month beyond (the server's default too). */
export function granularityFor(from: string, to: string): Granularity {
  return (Date.parse(to) - Date.parse(from)) / 86400000 > 92 ? 'month' : 'day'
}

/** The dates of a preset, in UTC. "Last N months" are whole calendar months, this one included. */
export function presetRange(
  p: Exclude<HistoryPreset, 'custom'>,
  today: Date
): { from: string; to: string; granularity: Granularity } {
  const y = today.getUTCFullYear()
  const m = today.getUTCMonth()
  const t = ymd(utcDay(y, m, today.getUTCDate()))
  switch (p) {
    case 'this_month':
      return { from: ymd(utcDay(y, m, 1)), to: t, granularity: 'day' }
    case 'last_month':
      return { from: ymd(utcDay(y, m - 1, 1)), to: ymd(utcDay(y, m, 0)), granularity: 'day' }
    default: {
      const months = { last_3: 3, last_6: 6, last_12: 12 }[p]
      return { from: ymd(utcDay(y, m - months + 1, 1)), to: t, granularity: 'month' }
    }
  }
}

/** Why a custom range cannot be read ('' when it can): the server's rules, 24 months at most. */
export function customRangeError(from: string, to: string, today: Date): string {
  const re = /^\d{4}-\d{2}-\d{2}$/
  if (!re.test(from) || Number.isNaN(Date.parse(from))) return 'Pick a start date.'
  if (!re.test(to) || Number.isNaN(Date.parse(to))) return 'Pick an end date.'
  if (from > to) return 'The start is after the end.'
  if (to > ymd(today)) return 'The end is in the future.'
  const t = new Date(to + 'T00:00:00Z')
  if (from < ymd(utcDay(t.getUTCFullYear(), t.getUTCMonth() - 24, t.getUTCDate())))
    return '24 months at most: pick a later start.'
  return ''
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "Nov 2026" for a month, "Nov 3" for a day (with the year when asked). */
export function periodLabel(p: string, withYear = false) {
  const month = MONTHS[Number(p.slice(5, 7)) - 1]
  if (p.length === 7) return `${month} ${p.slice(0, 4)}`
  return `${month} ${Number(p.slice(8))}${withYear ? `, ${p.slice(0, 4)}` : ''}`
}

export interface HistoryTable {
  columns: { sku: string; label: string; unit: string; aggregate: 'sum' | 'peak' }[]
  rows: { period: string; label: string; cells: (number | null)[]; invoiced: number | null }[]
  totals: (number | null)[]
  /** The invoiced column: billing roles, the whole contract, month by month. */
  invoiced: { currency: string; total: number } | null
}

/**
 * The table under the chart, the same as the CSV: one row per period, one column per metric, for
 * every organization the person sees (scope "all") or one of them. Periods before the data are
 * empty, not zero. Invoices are per contract and per month: on the monthly table for "all" only.
 */
export function historyTable(h: UsageHistoryData, scope = 'all'): HistoryTable {
  const pick = (p: UsageHistoryData['series'][number]['points'][number]) =>
    scope === 'all' ? p.quantity : p.by_organization[scope] ?? 0
  // Invoices are per contract and per month: a column on the monthly table for all organizations.
  const amounts = h.amounts && !h.amounts.unavailable && scope === 'all' && h.granularity === 'month' ? h.amounts : null
  const byMonth = new Map((amounts?.months ?? []).map((m) => [m.month, m.invoiced]))
  const columns = h.series.map((s) => ({ sku: s.sku, label: s.name, unit: s.unit, aggregate: s.aggregate }))
  const rows = h.periods.map((period, i) => ({
    period,
    label: periodLabel(period, h.granularity === 'day'),
    cells: h.series.map((s) =>
      s.points[i]?.no_data ? null : pick(s.points[i] ?? { period, quantity: 0, by_organization: {} })
    ),
    invoiced: amounts ? byMonth.get(period) ?? 0 : null,
  }))
  const totals = h.series.map((s, j) => {
    const known = rows.map((r) => r.cells[j]).filter((v): v is number => v != null)
    if (!known.length) return null
    return Math.round((s.aggregate === 'peak' ? Math.max(...known) : known.reduce((a, b) => a + b, 0)) * 10) / 10
  })
  return { columns, rows, totals, invoiced: amounts ? { currency: amounts.currency, total: amounts.total } : null }
}

export function csvCell(v: string | number | null) {
  if (v == null) return ''
  const s = String(v)
  // Quoted when needed, and never read as a formula by a spreadsheet.
  const safe = /^[=+\-@\t\r]/.test(s) && typeof v === 'string' && !/^[+-]?\d+(?:\.\d+)?$/.test(s) ? `'${s}` : s
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

/** The table as CSV: periods as dates, quantities as plain numbers, invoices in currency units. */
export function historyCSV(h: UsageHistoryData, scope = 'all'): string {
  const t = historyTable(h, scope)
  const org = scope === 'all' ? '' : h.organizations.find((o) => o.id === scope)?.name ?? scope
  const head = [
    'Period',
    ...(org ? ['Organization'] : []),
    ...t.columns.map((c) => `${c.label} (${c.unit}${c.aggregate === 'peak' ? ', peak' : ''})`),
    ...(t.invoiced ? [`Invoiced (${t.invoiced.currency})`] : []),
  ]
  const lines = [head.map(csvCell).join(',')]
  for (const r of t.rows) {
    lines.push(
      [
        r.period,
        ...(org ? [org] : []),
        ...r.cells,
        ...(t.invoiced ? [r.invoiced == null ? null : (r.invoiced / 100).toFixed(2)] : []),
      ]
        .map(csvCell)
        .join(',')
    )
  }
  lines.push(
    ['Total', ...(org ? [org] : []), ...t.totals, ...(t.invoiced ? [(t.invoiced.total / 100).toFixed(2)] : [])]
      .map(csvCell)
      .join(',')
  )
  return lines.join('\n') + '\n'
}

export type BuildPreset = 'last_30' | Exclude<HistoryPreset, 'last_6'>

export const BUILD_PRESETS: { id: BuildPreset; label: string }[] = [
  { id: 'last_30', label: 'Last 30 days' },
  { id: 'this_month', label: 'This month' },
  { id: 'last_month', label: 'Last month' },
  { id: 'last_3', label: 'Last 3 months' },
  { id: 'last_12', label: 'Last 12 months' },
  { id: 'custom', label: 'Custom range' },
]

/** The dates of a build usage preset, in UTC: the last 30 days day by day, else the history's. */
export function buildRange(
  p: Exclude<BuildPreset, 'custom'>,
  today: Date
): { from: string; to: string; granularity: Granularity } {
  if (p !== 'last_30') return presetRange(p, today)
  const t = utcDay(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  return { from: ymd(new Date(t.getTime() - 29 * 86400000)), to: ymd(t), granularity: 'day' }
}

/** A build duration: 45 s, 3 min 05 s, 1 h 02 min. */
export function buildDuration(seconds: number) {
  const s = Math.round(seconds)
  if (s < 60) return `${s} s`
  if (s < 3600) return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`
  return `${Math.floor(s / 3600)} h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')} min`
}

const SIZE_COLORS = [
  'var(--brand-9)',
  'var(--info-9)',
  'var(--positive-9)',
  'var(--warning-9)',
  'var(--accent-9, var(--purple-9))',
]

/** One color per builder size, in the catalog's order; beyond the largest, no builder and unknown apart. */
export function buildSizeColor(size: string, catalog: string[]) {
  if (size === 'unknown') return 'var(--neutral-7)'
  if (size === 'none') return 'var(--neutral-9)'
  if (size.endsWith('+')) return 'var(--negative-9)'
  const i = catalog.indexOf(size)
  return SIZE_COLORS[(i < 0 ? catalog.length : i) % SIZE_COLORS.length]
}

export type BuildSortKey =
  | 'name'
  | 'builds'
  | 'counted_build_minutes'
  | 'deploy_minutes'
  | 'avg_build_seconds'
  | 'p95_build_seconds'
  | 'cost'
  | 'share'

export interface BuildServiceFilter {
  q: string
  type: string
  size: string
  built: 'all' | 'built' | 'not_built'
}

/**
 * The services table: the search (name or id), the type, a builder size used, built or not, then
 * sorted on a column (name ascending, numbers descending by default). Time not attributed to a
 * service always comes last.
 */
export function buildServiceRows(
  services: BuildServiceUsage[],
  f: BuildServiceFilter,
  sort: { key: BuildSortKey; desc: boolean }
) {
  const q = f.q.trim().toLowerCase()
  const rows = services.filter(
    (s) =>
      (!q || s.name.toLowerCase().includes(q) || s.service_id.toLowerCase().includes(q)) &&
      (!f.type || s.type === f.type) &&
      (!f.size || s.sizes.includes(f.size)) &&
      (f.built === 'all' || (f.built === 'built' ? s.builds > 0 : s.builds === 0))
  )
  const val = (s: BuildServiceUsage) =>
    sort.key === 'name' ? s.name.toLowerCase() : sort.key === 'cost' ? s.cost ?? 0 : s[sort.key]
  return rows.sort((a, b) => {
    if (!a.service_id !== !b.service_id) return a.service_id ? -1 : 1
    const x = val(a),
      y = val(b)
    if (x === y) return a.name.localeCompare(b.name)
    return (x < y ? -1 : 1) * (sort.desc ? -1 : 1)
  })
}
