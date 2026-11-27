import type { BillingInfo, PaymentMethod } from 'qovery-pricing-typescript-axios'

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
  if (vat && !/^[A-Za-z0-9.-]{2,20}$/.test(vat)) errs.vat_number = 'Use 2–20 letters, digits, periods or hyphens'
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
