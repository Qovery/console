import type { Gate, GateIntro, PaywallInfo, PaywallOption, Period } from 'qovery-pricing-typescript-axios'

/** The gate for an action id (cluster.create) or a SKU (service_catalog). */
export function gateFor(gates: Gate[] | undefined, key: string): Gate | undefined {
  return gates?.find((g) => g.action === key) ?? gates?.find((g) => g.sku === key)
}

// The intros shown in this session, by organization and SKU: the gates read again before
// pricing-api has the "shown" never bring one back.
const introsSeen = new Set<string>()

/** The intro to show before going on with an allowed action, unless this session already showed it. */
export function pendingIntro(organizationId: string, g?: Gate): GateIntro | undefined {
  if (!g?.allowed || !g.intro) return undefined
  return introsSeen.has(`${organizationId}|${g.intro.sku}`) ? undefined : g.intro
}

export function markIntroSeen(organizationId: string, sku: string) {
  introsSeen.add(`${organizationId}|${sku}`)
}

/** Locked: refused, with a paywall to show. Allowed, unknown and unlinked are never locked. */
export function isLocked(g?: Gate): g is Gate & { paywall: PaywallInfo } {
  return !!g && !g.allowed && !!g.paywall
}

/**
 * The paywall in an error body: pricing-api's check answer as core passes it in its 402
 * ({paywall}, or wrapped once in {data} or {response: {data}}). null when there is none.
 */
export function paywallFromBody(body: unknown): { paywall: PaywallInfo; sku?: string; action?: string } | null {
  const seen = [body, (body as { data?: unknown })?.data, (body as { response?: { data?: unknown } })?.response?.data]
  for (const b of seen) {
    const p = (b as { paywall?: PaywallInfo } | undefined)?.paywall
    if (p && typeof p === 'object' && Array.isArray(p.options) && typeof p.headline === 'string') {
      const x = b as { sku?: string; action?: string }
      return { paywall: p, sku: x.sku ?? p.sku, action: x.action }
    }
  }
  return null
}

/** A 402 from core for an action pricing-api refused: the action or SKU to read the gate of. */
export function gateKeyFromBody(status: number | undefined, body: unknown): { action?: string; sku?: string } | null {
  if (status !== 402) return null
  const seen = [body, (body as { data?: unknown })?.data, (body as { response?: { data?: unknown } })?.response?.data]
  for (const b of seen) {
    const x = b as { sku?: unknown; action?: unknown } | undefined
    if (x && (typeof x.action === 'string' || typeof x.sku === 'string'))
      return {
        action: typeof x.action === 'string' ? x.action : undefined,
        sku: typeof x.sku === 'string' ? x.sku : undefined,
      }
  }
  return null
}

// format.ts's money, here so the rules load in plain Node (no runtime import).
const cents = (c: number, currency: string) => {
  const v = c / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: Math.abs(v) >= 100 || Number.isInteger(v) ? 0 : 2,
  }).format(v)
}

/** "$1,124 per month, $750 more than today" for an upgrade or add-on option. */
export function optionPrice(o: PaywallOption): string {
  if (o.amount == null || !o.currency) return ''
  const per = `${cents(o.amount, o.currency)} per ${o.period ?? 'month'}`
  if (o.type === 'upgrade' && o.difference != null && o.difference !== o.amount)
    return `${per}, ${cents(o.difference, o.currency)} more than today`
  return per
}

/** What the inline lock on a button says: the trial when there is one, else the next step. */
export function lockLabel(g?: Gate): string {
  if (!isLocked(g)) return ''
  const first = g.paywall.options[0]
  if (!first) return 'Not in your plan'
  if (first.type === 'start_trial') return `Try it free for ${first.days ?? 14} days`
  if (first.type === 'upgrade') return first.plan_name ? `${first.plan_name} plan` : 'Upgrade'
  if (first.type === 'request_admin') return 'Ask an admin'
  if (first.type === 'update_payment') return 'Payment required'
  return 'Talk to us'
}

/** The plans and add-ons a trial can continue on at its end: the paywall's priced options. */
export function continueChoices(p?: PaywallInfo): PaywallOption[] {
  return (p?.options ?? [])
    .filter((o) => (o.type === 'upgrade' && !!o.plan) || (o.type === 'addon' && !!o.addon))
    .filter((o) => o.amount != null && o.amount > 0)
}

/** The body of a trial start: continue only with the person's explicit consent. */
export function trialRequest(sku: string, cont: PaywallOption | undefined, consent: boolean, period?: Period) {
  if (!cont || !consent) return { sku }
  return {
    sku,
    continue:
      cont.type === 'upgrade'
        ? { plan: cont.plan, period: cont.period ?? period }
        : { addon: cont.addon, period: cont.period ?? period },
    accept_auto_charge: true,
  }
}

/** When a trial started today ends, as a date (UTC). */
export function trialEnds(days: number, now = new Date()): string {
  return new Date(now.getTime() + days * 86400000).toISOString()
}
