import type {
  CustomerInvoice,
  InvoiceDetails,
  InvoiceLineUsage1 as InvoiceLineUsage,
} from 'qovery-pricing-typescript-axios'
import { csvCell, periodLabel } from './usage-rules'

export type StatusFilter = 'all' | 'unpaid' | 'paid' | 'voided'

/** How a customer reads an invoice's status, and the badge color. */
export function invoiceStatus(
  inv: Pick<CustomerInvoice, 'status' | 'due_date'>,
  now = new Date()
): { label: string; color: 'green' | 'red' | 'yellow' | 'neutral' } {
  switch (inv.status) {
    case 'paid':
      return { label: 'Paid', color: 'green' }
    case 'voided':
      return { label: 'Voided', color: 'neutral' }
    case 'pending':
      return { label: 'Pending', color: 'neutral' }
    case 'not_paid':
      return { label: 'Overdue', color: 'red' }
    case 'payment_due':
      return inv.due_date && new Date(inv.due_date) < now
        ? { label: 'Overdue', color: 'red' }
        : { label: 'Due', color: 'yellow' }
    default:
      return { label: 'Issued', color: 'neutral' }
  }
}

export function matchesStatus(inv: CustomerInvoice, f: StatusFilter) {
  if (f === 'all') return true
  if (f === 'unpaid') return inv.status === 'payment_due' || inv.status === 'not_paid'
  return inv.status === f
}

/** The years invoices were issued in, newest first (UTC, like the invoice dates). */
export function invoiceYears(list: CustomerInvoice[]): number[] {
  return [...new Set(list.map((i) => new Date(i.date).getUTCFullYear()))].sort((a, b) => b - a)
}

export function filterInvoices(list: CustomerInvoice[], status: StatusFilter, year: number | 'all') {
  return list.filter((i) => matchesStatus(i, status) && (year === 'all' || new Date(i.date).getUTCFullYear() === year))
}

/** What is due now, per currency (invoices Chargebee can still collect). */
export function amountDue(list: CustomerInvoice[]): { currency: string; amount: number; count: number }[] {
  const by = new Map<string, { currency: string; amount: number; count: number }>()
  for (const i of list) {
    if (!i.collectable || i.amount_due <= 0) continue
    const cur = by.get(i.currency) ?? { currency: i.currency, amount: 0, count: 0 }
    cur.amount += i.amount_due
    cur.count += 1
    by.set(i.currency, cur)
  }
  return [...by.values()]
}

/** Whole minutes to wait before the next payment attempt (Retry-After is in seconds). */
export const minutesToWait = (seconds: number) => Math.max(1, Math.ceil(seconds / 60))

/**
 * runSequential calls fn on each item in turn, gapMs apart, until done or the signal aborts.
 * Used by "Download all" so the browser and Chargebee are not flooded.
 */
export async function runSequential<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  o: {
    gapMs?: number
    signal?: AbortSignal
    onProgress?: (done: number, failed: number) => void
    sleep?: (ms: number) => Promise<void>
  } = {}
): Promise<{ done: number; failed: number; cancelled: boolean }> {
  const sleep = o.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)))
  let done = 0
  let failed = 0
  for (let i = 0; i < items.length; i++) {
    if (o.signal?.aborted) return { done, failed, cancelled: true }
    try {
      await fn(items[i])
      done++
    } catch {
      failed++
    }
    o.onProgress?.(done, failed)
    if (i < items.length - 1 && o.gapMs) await sleep(o.gapMs)
  }
  return { done, failed, cancelled: !!o.signal?.aborted && done + failed < items.length }
}

const LINE_KIND: Record<string, string> = { plan: 'Plan', addon: 'Add-on', usage: 'Usage', charge: 'One-off charge' }

export const lineKindLabel = (kind: string) => LINE_KIND[kind] ?? kind

/** What a usage section says about its record, or '' when every day of the period is there. */
export function usageCoverageText(u: Pick<InvoiceLineUsage, 'available' | 'since' | 'from' | 'to'>): string {
  if (u.available === 'complete') return ''
  if (u.available === 'partial')
    return `Usage per day is recorded from ${u.since} on: the days of this period before it are not shown.`
  return u.since
    ? `The usage behind this line is not available: usage per day is recorded from ${u.since} on.`
    : 'The usage behind this line is not available for this period.'
}

/**
 * The chart and table of a usage section: one row per day, the quantity per organization when the
 * account has several (keys are organization ids), else under "quantity".
 */
export function usageDays(u: Pick<InvoiceLineUsage, 'days' | 'organizations'>) {
  const split = u.organizations.length > 1
  return u.days.map((d) => {
    const row: Record<string, number | string> = { day: d.day, label: periodLabel(d.day), quantity: d.quantity }
    if (split) for (const o of u.organizations) row[o.organization_id] = d.organizations?.[o.organization_id] ?? 0
    return row
  })
}

/**
 * The invoice as CSV: one row per line, then each usage line's days (per organization when there
 * are several) and the builds per service behind it. Amounts in currency units, quantities as
 * plain numbers, cells safe from spreadsheet formulas.
 */
export function invoiceDetailsCSV(d: InvoiceDetails): string {
  const cur = d.currency
  const money2 = (c: number | undefined | null) => (c == null ? null : (c / 100).toFixed(2))
  const head = [
    'Invoice',
    'Record',
    'Line',
    'Kind',
    'From',
    'To',
    'Day',
    'Organization',
    'Service',
    'Builder sizes',
    'Quantity',
    'Unit',
    `Unit price (${cur})`,
    `Amount (${cur})`,
    `Discount (${cur})`,
    `Net (${cur})`,
    'Builds',
    'Build minutes',
    'Counted build minutes',
    'Deploy minutes',
  ]
  const rows: (string | number | null)[][] = []
  const day = (iso: string | null) => (iso ? iso.slice(0, 10) : null)
  const row = (o: {
    record: string
    line: string
    kind?: string
    from?: string | null
    to?: string | null
    day?: string
    org?: string
    service?: string
    sizes?: string
    qty?: number
    unit?: string
    unitPrice?: number
    amount?: number
    discount?: number
    net?: number
    builds?: number
    buildMin?: number
    counted?: number
    deployMin?: number
  }) =>
    rows.push([
      d.id,
      o.record,
      o.line,
      o.kind ?? null,
      o.from ?? null,
      o.to ?? null,
      o.day ?? null,
      o.org ?? null,
      o.service ?? null,
      o.sizes ?? null,
      o.qty ?? null,
      o.unit ?? null,
      money2(o.unitPrice),
      money2(o.amount),
      money2(o.discount),
      money2(o.net),
      o.builds ?? null,
      o.buildMin ?? null,
      o.counted ?? null,
      o.deployMin ?? null,
    ])
  for (const l of d.lines) {
    row({
      record: 'line',
      line: l.label,
      kind: lineKindLabel(l.kind),
      from: day(l.from),
      to: day(l.to),
      qty: l.quantity,
      unit: l.unit,
      unitPrice: l.unit_price,
      amount: l.amount,
      discount: l.discount,
      net: l.net,
    })
  }
  if (d.discounts)
    row({
      record: 'discount',
      line: d.discount_lines.map((x) => x.description).join('; ') || 'Discounts',
      net: -d.discounts,
    })
  if (d.tax) row({ record: 'tax', line: 'Tax', net: d.tax })
  row({ record: 'total', line: 'Total', net: d.total })
  for (const l of d.lines) {
    const u = l.usage
    if (!u) continue
    const split = u.organizations.length > 1
    for (const x of u.days) {
      if (split)
        for (const o of u.organizations)
          row({
            record: 'usage_day',
            line: l.label,
            day: x.day,
            org: o.name,
            qty: x.organizations?.[o.organization_id] ?? 0,
            unit: u.unit,
          })
      else
        row({
          record: 'usage_day',
          line: l.label,
          day: x.day,
          org: u.organizations[0]?.name,
          qty: x.quantity,
          unit: u.unit,
        })
    }
    for (const sv of u.builds?.services ?? []) {
      row({
        record: 'build_service',
        line: l.label,
        from: u.from,
        to: u.to,
        org: sv.organization,
        service: sv.name,
        sizes: sv.sizes.join('; '),
        builds: sv.builds,
        buildMin: sv.build_minutes,
        counted: sv.counted_build_minutes,
        deployMin: sv.deploy_minutes,
      })
    }
  }
  return [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\n') + '\n'
}
