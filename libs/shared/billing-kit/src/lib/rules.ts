/*
 * The billing kit's pure rules for invoices, payment methods, billing information, AWS
 * Marketplace offers, plan changes, cancellation, usage history, build usage and invoice details: no React, no network, so they
 * are unit tested (web/tests/billing-kit.test.ts).
 */
import type {
  Availability,
  BillingInfo,
  BuildServiceUsage,
  CreditOption,
  CustomerInvoice,
  EstimateLine,
  Granularity,
  InvoiceDetails,
  InvoiceLineUsage,
  PaymentMethod,
  UsageHistoryData,
} from './types'

// ------------------------------------------------------------------ AWS Marketplace offer links

/**
 * validOfferURL is the server's rule (validOfferURL in api/internal/httpapi/awsmarketplace.go):
 * only AWS Marketplace pages pass, https on aws.amazon.com or console.aws.amazon.com (or a
 * subdomain of the latter), no user info, no port, a path naming the marketplace. The console
 * checks it again before it links to an offer, so a bad link stored by mistake is never shown.
 */
export function validOfferURL(raw: string | null | undefined): boolean {
  if (!raw || raw.length > 2048) return false
  for (const c of raw) {
    const code = c.codePointAt(0) ?? 0
    if (c === '\\' || /\s/u.test(c) || code < 0x20 || (code >= 0x7f && code <= 0x9f)) return false
  }
  if (!/^https:\/\//i.test(raw)) return false
  // The authority as typed: plain ASCII host only (no user info, port, brackets or Unicode that
  // the URL parser would quietly rewrite into an allowed name).
  const authority = raw.slice('https://'.length).split(/[/?#]/)[0]
  if (!/^[A-Za-z0-9.-]+$/.test(authority)) return false
  let u: URL
  try {
    u = new URL(raw)
  } catch {
    return false
  }
  const host = u.hostname.toLowerCase()
  if (u.protocol !== 'https:' || u.username || u.password || u.port || host !== authority.toLowerCase()) return false
  if (host !== 'aws.amazon.com' && host !== 'console.aws.amazon.com' && !host.endsWith('.console.aws.amazon.com'))
    return false
  let path = u.pathname
  try {
    path = decodeURIComponent(path)
  } catch {
    return false
  }
  return path.toLowerCase().includes('marketplace')
}

/** A 12-digit AWS account id, as the server requires. */
export const validAwsAccountId = (v: string) => /^[0-9]{12}$/.test(v)

// ------------------------------------------------------------------ invoices

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

// ------------------------------------------------------------------ invoice details

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

// ------------------------------------------------------------------ payment methods

export type CardState = 'ok' | 'expiring' | 'expired'

/** A card expires at the end of its expiry month; "expiring" is within 60 days. */
export function cardState(
  pm: Pick<PaymentMethod, 'status' | 'expiry_month' | 'expiry_year'>,
  now = new Date()
): CardState {
  if (pm.status === 'expired') return 'expired'
  if (pm.expiry_month && pm.expiry_year) {
    const end = Date.UTC(pm.expiry_year, pm.expiry_month, 1) // first day after the expiry month
    if (end <= now.getTime()) return 'expired'
    if (end - now.getTime() <= 60 * 86400000) return 'expiring'
  }
  return pm.status === 'expiring' ? 'expiring' : 'ok'
}

const BRANDS: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  american_express: 'American Express',
  discover: 'Discover',
  jcb: 'JCB',
  diners_club: 'Diners Club',
  bancontact: 'Bancontact',
  cartes_bancaires: 'Cartes Bancaires',
}

export function paymentMethodLabel(pm: PaymentMethod) {
  if (pm.type === 'card')
    return `${BRANDS[pm.brand ?? ''] ?? (pm.brand ? pm.brand.replace(/_/g, ' ') : 'Card')} ending in ${pm.last4 ?? '····'}`
  if (pm.type === 'direct_debit') return `Bank account ending in ${pm.last4 ?? '····'}`
  return pm.type.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
}

// ------------------------------------------------------------------ billing information

export const emptyBillingInfo: BillingInfo = {
  company: '',
  first_name: '',
  last_name: '',
  email: '',
  line1: '',
  line2: '',
  city: '',
  zip: '',
  state: '',
  country: '',
  vat_number: '',
}

const LIMITS: Partial<Record<keyof BillingInfo, number>> = {
  company: 250,
  first_name: 150,
  last_name: 150,
  email: 70,
  line1: 150,
  line2: 150,
  city: 50,
  zip: 20,
  state: 50,
}

/** The server's checks (validateBillingInfo in customerbilling.go): field → what is wrong. */
export function validateBillingInfo(b: BillingInfo): Partial<Record<keyof BillingInfo, string>> {
  const errs: Partial<Record<keyof BillingInfo, string>> = {}
  for (const [k, max] of Object.entries(LIMITS) as [keyof BillingInfo, number][]) {
    if ([...b[k].trim()].length > max) errs[k] = `${max} characters at most`
  }
  const email = b.email.trim()
  if (!email) errs.email = 'Required: invoices are sent to this address'
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.email = 'Enter an email address'
  const country = b.country.trim()
  if (country && !/^[A-Za-z]{2}$/.test(country)) errs.country = 'Use the two-letter code, e.g. FR or US'
  const vat = b.vat_number.replace(/\s/g, '')
  if (vat && !/^[A-Za-z0-9.-]{2,20}$/.test(vat)) errs.vat_number = 'Letters and digits only, 20 characters at most'
  return errs
}

/** What is sent: trimmed, country and VAT number in capitals, no spaces in the VAT number. */
export function normalizeBillingInfo(b: BillingInfo): BillingInfo {
  const t = (s: string) => s.trim()
  return {
    company: t(b.company),
    first_name: t(b.first_name),
    last_name: t(b.last_name),
    email: t(b.email),
    line1: t(b.line1),
    line2: t(b.line2),
    city: t(b.city),
    zip: t(b.zip),
    state: t(b.state),
    country: t(b.country).toUpperCase(),
    vat_number: b.vat_number.replace(/\s/g, '').toUpperCase(),
  }
}

// ------------------------------------------------------------------ dates and amounts

/** A date in the reader's own locale (invoice dates are days, read in UTC). */
export function localDate(iso?: string | null, locale?: string) {
  return iso
    ? new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
    : ''
}

/** An amount in cents with its currency, two decimals, in the reader's locale. */
export function amount(cents: number, currency: string, locale?: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

// ------------------------------------------------------------------ quantities and the bill

const n0 = (n: number) => Math.round(n).toLocaleString('en-US')

/** A quantity with its unit: "1,025 minutes", "1 member", "12.5 minutes". */
export function quantity(n: number, unit: string) {
  const v = Number.isInteger(n) ? n0(n) : (Math.round(n * 10) / 10).toLocaleString('en-US')
  if (!unit) return v
  return `${v} ${n === 1 ? unit.replace(/s$/, '') : unit}`
}

/** A line of the estimate as the customer reads it: usage with its unit, several add-ons counted. */
export function estimateLineLabel(l: EstimateLine, unitOf: (sku: string) => string = () => '') {
  if (l.kind === 'overage') return `${l.label}: ${quantity(l.quantity, l.sku ? unitOf(l.sku) : '')}`
  if (l.quantity > 1) return `${n0(l.quantity)} × ${l.label}`
  return l.label
}

/** A key per review of a plan change: a double click or a retry is applied once. */
export function newIdempotencyKey(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
  if (c?.randomUUID) return c.randomUUID()
  return `k-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

/** What a change of plan or billing period is, in a few words. */
export function changeKind(q: { direction: string; period: string; effective_at: string }, currentPeriod: string) {
  if (q.direction === 'same') return 'Keep your current plan'
  if (q.period !== currentPeriod) return q.period === 'year' ? 'Switch to yearly billing' : 'Switch to monthly billing'
  return q.direction === 'downgrade' ? 'Downgrade' : 'Upgrade'
}

/** What the customer does instead when a change cannot be confirmed here. */
/** What the kit says about one of Qovery's own organizations (an internal account, never billed). */
export const INTERNAL_NOTHING_BILLED = 'Internal organization: nothing is billed'

export function changeBlockedText(
  a: Availability | undefined,
  what: 'plan' | 'cancel' | 'credits' | 'reactivate'
): { title: string; body: string; contact: boolean } | null {
  if (!a || a.available) return null
  const verb = {
    plan: 'change your plan',
    cancel: 'cancel',
    credits: 'buy prepaid credits',
    reactivate: 'reactivate your subscription',
  }[what]
  switch (a.code) {
    case 'PAYMENT_ACTIONS_UNAVAILABLE':
      return {
        title: 'Billing changes are not available yet',
        body:
          what === 'plan'
            ? `You can compare plans and see the prices. To ${verb} now, contact us.`
            : `To ${verb} now, contact us.`,
        contact: true,
      }
    case 'SELF_SERVE_UNAVAILABLE':
      return {
        title:
          what === 'plan'
            ? 'Contact us to change your plan'
            : what === 'cancel'
              ? 'Contact us to cancel'
              : `Contact us to ${verb}`,
        body: "This organization's subscription is not managed from the console yet. We make the change for you.",
        contact: true,
      }
    case 'CONTRACT_MANAGED':
      return what === 'credits'
        ? {
            title: 'Prepaid usage is set by your contract',
            body: 'Your account manager adds prepaid units with you.',
            contact: true,
          }
        : {
            title: 'Your plan is set by your contract',
            body: 'Your account manager changes it with you.',
            contact: true,
          }
    case 'AWS_MARKETPLACE':
      return {
        title: 'You pay through AWS Marketplace',
        body:
          what === 'credits'
            ? 'Your account manager adds prepaid units to your private offer in AWS.'
            : `To ${verb}, your account manager updates your private offer in AWS.`,
        contact: true,
      }
    case 'CANCELLATION_SCHEDULED':
      return {
        title: 'Your subscription is set to end',
        body: 'Keep your subscription first, then change the plan.',
        contact: false,
      }
    case 'SUBSCRIPTION_ENDED':
      return {
        title: 'Your subscription has ended',
        body: 'Reactivate it from the usage page, or contact us.',
        contact: true,
      }
    case 'PAYMENT_METHOD_REQUIRED':
      return { title: 'Add a card first', body: a.detail ?? 'This is paid by card.', contact: false }
    case 'INTERNAL_ACCOUNT':
      return {
        title: INTERNAL_NOTHING_BILLED,
        body: 'Plans, payments, credits and cancellations do not apply to it.',
        contact: false,
      }
  }
  return { title: 'This change is not available', body: a.detail ?? '', contact: true }
}

/** Why a quantity of prepaid credits cannot be bought ('' when it can): the server's bounds. */
export function creditQuantityError(
  o: Pick<CreditOption, 'min' | 'max' | 'step' | 'unit' | 'annual'>,
  quantity: number,
  annual = false
): string {
  const min = annual && o.annual ? o.annual.min : o.min
  if (!Number.isInteger(quantity) || quantity <= 0) return 'Enter a whole number'
  if (quantity < min) return `At least ${n0(min)} ${o.unit}${annual ? ' for a year upfront' : ''}`
  if (quantity > o.max) return `At most ${n0(o.max)} ${o.unit} at once. Contact us for more`
  if (quantity % o.step !== 0) return `In steps of ${n0(o.step)} ${o.unit}`
  return ''
}

// ------------------------------------------------------------------ usage history periods

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

function csvCell(v: string | number | null) {
  if (v == null) return ''
  const s = String(v)
  // Quoted when needed, and never read as a formula by a spreadsheet.
  const safe = /^[=+\-@\t\r]/.test(s) && typeof v === 'string' ? `'${s}` : s
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

// ------------------------------------------------------------------ build usage

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
