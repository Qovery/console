import type { EstimateLine, Value } from 'qovery-pricing-typescript-axios'

/** Cents to money, no decimals above 100 units. */
export function money(cents: number, currency = 'USD') {
  const v = cents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: Math.abs(v) >= 100 || Number.isInteger(v) ? 0 : 2,
  }).format(v)
}

export const num = (n: number) => Math.round(n).toLocaleString('en-US')

/** A limit as a customer reads it: Included / Not included / Unlimited / 25 members. */
export function valueText(v: Value, unit?: string) {
  if (v === true) return 'Included'
  if (v === false) return 'Not included'
  if (v === 'unlimited') return 'Unlimited'
  return `${num(v)}${unit ? ` ${unit}` : ''}`
}

export const date = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
    : ''

/** Monthly price of a plan in a currency and billing period (yearly prices shown per month). */
export function monthly(
  prices: { currency: string; period: string; amount: number }[],
  currency: string,
  period: 'month' | 'year'
) {
  const p = prices.find((x) => x.currency === currency && x.period === period)
  if (!p) return null
  return period === 'year' ? Math.round(p.amount / 12) : p.amount
}

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

/** A quantity with its unit: "1,025 minutes", "1 member", "12.5 minutes". */
export function quantity(n: number, unit: string) {
  const v = Number.isInteger(n) ? num(n) : (Math.round(n * 10) / 10).toLocaleString('en-US')
  if (!unit) return v
  return `${v} ${n === 1 ? unit.replace(/s$/, '') : unit}`
}

/** A line of the estimate as the customer reads it: usage with its unit, several add-ons counted. */
export function estimateLineLabel(l: EstimateLine, unitOf: (sku: string) => string = () => '') {
  if (l.kind === 'overage') return `${l.label}: ${quantity(l.quantity, l.sku ? unitOf(l.sku) : '')}`
  if (l.quantity > 1) return `${num(l.quantity)} × ${l.label}`
  return l.label
}
