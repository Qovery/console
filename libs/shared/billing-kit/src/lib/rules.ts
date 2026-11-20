/*
 * The billing kit's pure rules for invoices, payment methods, billing information and AWS
 * Marketplace offers: no React, no network, so they are unit tested (web/tests/billing-kit.test.ts).
 */
import type { BillingInfo, CustomerInvoice, PaymentMethod } from './types'

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
