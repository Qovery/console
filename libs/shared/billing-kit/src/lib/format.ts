import type { Value } from './types'

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
