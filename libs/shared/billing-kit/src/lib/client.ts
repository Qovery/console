/*
 * The billing kit's data source: pricing-api's customer API with the user's Qovery token. Plan
 * changes, cancellation, reactivation, prepaid credits and usage history included: core relays
 * none of it. The back office
 * passes its own client (staff previews, nothing applied).
 */
import { z } from 'zod'
import type {
  AddonPurchaseResult,
  AwsMarketplace,
  BillingInfo,
  BillingInfoView,
  BillingUsage,
  BuildUsageData,
  CancelReason,
  Cancellation,
  CancellationResult,
  CreditPurchaseResult,
  Credits,
  CustomerInvoice,
  CustomerTrial,
  DiscountQuote,
  Discounts,
  EmailPreferences,
  Gates,
  Granularity,
  IntroAction,
  InvoiceDetails,
  InvoiceDownload,
  InvoicePage,
  Offers,
  PaymentMethods,
  PaymentSession,
  PaywallEvent,
  PaywallOptionType,
  Period,
  PlanChangeResult,
  PlanOptions,
  PlanProposal,
  ProposalDismissReason,
  Proposals,
  PublicPlans,
  Reactivation,
  ReactivationResult,
  SignupTrial,
  Spend,
  Trial,
  TrialStartRequest,
  TrialStartResult,
  UpgradeRequest,
  UsageHistoryData,
} from './types'

const billingUsageSchema = z.object({
  access: z.enum(['member', 'billing', 'demo']),
  plan: z.object({ name: z.string() }),
  billing: z.object({
    currency: z.string().regex(/^[A-Z]{3}$/i),
    period: z.enum(['month', 'year']),
    term_end: z.string(),
    locked: z.boolean(),
  }),
  status: z.object({ status: z.enum(['ok', 'payment_failed', 'locked']) }),
  entitlements: z.array(
    z.object({
      sku: z.string(),
      name: z.string(),
      kind: z.enum(['feature', 'limit', 'meter']),
      unit: z.string(),
      value: z.union([z.number(), z.boolean(), z.literal('unlimited')]),
      used: z.number(),
      overage_unit_price: z.number(),
    })
  ),
  notes: z.array(z.string()),
  estimate: z
    .object({ lines: z.array(z.object({ label: z.string(), amount: z.number() })), total: z.number() })
    .nullish(),
  spend: z
    .object({
      spent: z.number(),
      account: z.object({ monthly_limit: z.number().nullable(), used_pct: z.number().nullish() }),
    })
    .nullish(),
  usage_insights: z
    .object({
      series: z.array(
        z.object({ sku: z.string(), points: z.array(z.object({ day: z.string(), quantity: z.number() })) })
      ),
      deployment_months: z.array(z.object({ month: z.string() })),
      projection: z.array(z.object({ sku: z.string() })),
      value: z
        .object({ lines: z.array(z.object({ sku: z.string() })), per_unit: z.array(z.object({ label: z.string() })) })
        .nullish(),
    })
    .nullish(),
})

export interface PricingClient {
  /** "live" applies plan changes; "preview" only quotes them (staff previews, demos). */
  mode: 'live' | 'preview'
  publicPlans(): Promise<PublicPlans>
  billingUsage(organizationId: string): Promise<BillingUsage>
  spendLimits(organizationId: string): Promise<Spend>
  // Optional: without them, <UsagePage> hides Change plan (billing roles only on the server).
  planOptions?(organizationId: string): Promise<PlanOptions>
  quotePlanChange?(organizationId: string, plan: string, period?: Period): Promise<PlanChangeResult>
  /** idempotencyKey: one per review, so a double click or a retry applies once. */
  changePlan?(
    organizationId: string,
    plan: string,
    period: Period | undefined,
    idempotencyKey: string
  ): Promise<PlanChangeResult>
  /** "Keep my current plan": drops the change scheduled for the renewal. */
  keepPlan?(organizationId: string): Promise<{ removed: boolean }>
  /** A new organization's trial: keep its plan at the end (with the consent, a card on file), or stop keeping it. */
  keepSignupTrial?(
    organizationId: string,
    keep: boolean,
    acceptAutoCharge: boolean
  ): Promise<{ signup_trial: SignupTrial | null }>
  // Optional: cancellation at the end of the term (billing roles only).
  cancellation?(organizationId: string): Promise<Cancellation>
  cancel?(
    organizationId: string,
    req: { confirm: string; reason: CancelReason; feedback?: string }
  ): Promise<CancellationResult>
  /** Undoes a scheduled cancellation, or withdraws a request. */
  keepSubscription?(organizationId: string): Promise<CancellationResult>
  // Optional: prepaid credits (billing roles). Without them, members and hosts see balances only.
  credits?(organizationId: string): Promise<Credits>
  quoteCredits?(
    organizationId: string,
    req: { sku: string; quantity: number; annual?: boolean }
  ): Promise<CreditPurchaseResult>
  /** Charges the card on file now. idempotencyKey: one per review. 402 PAYMENT_FAILED adds nothing. */
  buyCredits?(
    organizationId: string,
    req: { sku: string; quantity: number; annual?: boolean },
    idempotencyKey: string
  ): Promise<CreditPurchaseResult>
  // Optional: starting the subscription again once it ended (billing roles).
  reactivation?(organizationId: string): Promise<Reactivation>
  quoteReactivation?(organizationId: string, plan: string, period?: Period): Promise<ReactivationResult>
  /** Starts a new term today (or asks staff). idempotencyKey: one per review. */
  reactivate?(
    organizationId: string,
    plan: string,
    period: Period | undefined,
    idempotencyKey: string
  ): Promise<ReactivationResult>
  // Optional: usage over a period (any member; amounts for billing roles).
  usageHistory?(
    organizationId: string,
    range: { from: string; to: string; granularity?: Granularity }
  ): Promise<UsageHistoryData>
  // Optional: build usage over a period, per builder size and service (any member; costs for
  // billing roles). service: one service's builds ("" = the time not attributed to a service).
  buildUsage?(
    organizationId: string,
    range: { from: string; to: string; granularity?: Granularity; service?: string }
  ): Promise<BuildUsageData>
  // Optional: offers and upgrade requests (OfferHost, "Ask an admin") and email preferences.
  offers?(organizationId: string): Promise<Offers>
  offerEvent?(
    organizationId: string,
    offerId: number,
    event: 'shown' | 'clicked' | 'dismissed',
    surface: string
  ): Promise<void>
  /** Accepts a trial offer: the trial starts at once (billing roles only). */
  acceptOffer?(organizationId: string, offerId: number): Promise<{ trial: Trial }>
  /** source "paywall": asked from a paywall (counted in its funnel). */
  requestUpgrade?(
    organizationId: string,
    req: { sku?: string; plan_code?: string; message?: string; source?: 'paywall' }
  ): Promise<{ request: UpgradeRequest; notified: number; existing?: boolean }>
  closeUpgradeRequest?(organizationId: string, requestId: number, status: 'done' | 'declined'): Promise<void>
  // Optional: plan proposals Qovery staff send (billing roles; members get { proposal: null }).
  // Review quotes and accepts through the plan change rules, with the proposal's concession.
  proposals?(organizationId: string): Promise<Proposals>
  viewProposal?(organizationId: string, proposalId: number): Promise<void>
  /** Remind me later: the banner comes back after `days` (3, 7 or 14) with a reminder email. */
  snoozeProposal?(
    organizationId: string,
    proposalId: number,
    days: number
  ): Promise<{ status: string; snoozed_until: string }>
  dismissProposal?(
    organizationId: string,
    proposalId: number,
    req: { reason?: ProposalDismissReason; note?: string }
  ): Promise<{ status: string }>
  quoteProposal?(organizationId: string, proposalId: number): Promise<PlanChangeResult>
  /** idempotencyKey: one per review, as for a plan change. */
  acceptProposal?(organizationId: string, proposalId: number, idempotencyKey?: string): Promise<PlanChangeResult>
  emailPreferences?(organizationId: string): Promise<EmailPreferences>
  setEmailPreference?(organizationId: string, category: string, enabled: boolean): Promise<EmailPreferences>
  // Optional: the customer's own billing (billing roles only). Invoices, payment methods and
  // billing information live in Chargebee; pricing-api reads and writes them for the organization.
  invoices?(organizationId: string, page?: { limit?: number; offset?: string }): Promise<InvoicePage>
  /** One invoice in detail: its lines, and the usage behind each usage line. A read: it works when actions are not available. */
  invoice?(organizationId: string, invoiceId: string): Promise<InvoiceDetails>
  /** A short-lived link to the invoice's PDF: open it at once, never keep it. */
  invoicePdf?(organizationId: string, invoiceId: string): Promise<InvoiceDownload>
  /** Pay now: charges the payment method on file. 402 PAYMENT_FAILED, 409, 429 COLLECT_TOO_SOON (retryAfter). */
  collectInvoice?(organizationId: string, invoiceId: string, idempotencyKey: string): Promise<CustomerInvoice>
  paymentMethods?(organizationId: string): Promise<PaymentMethods>
  /** Chargebee's page to add or replace a card. redirectUrl is used only when it is a Qovery origin. */
  paymentMethodSession?(organizationId: string, redirectUrl?: string): Promise<PaymentSession>
  billingInfo?(organizationId: string): Promise<BillingInfoView>
  saveBillingInfo?(organizationId: string, info: BillingInfo): Promise<BillingInfoView>
  awsMarketplace?(organizationId: string): Promise<AwsMarketplace>
  requestAwsOffer?(organizationId: string, req: { aws_account_id: string; message?: string }): Promise<AwsMarketplace>
  // Optional: discounts in exchange for counterparts (billing roles). A request is reviewed by
  // Qovery; nothing changes on the subscription until it is approved.
  discounts?(organizationId: string): Promise<Discounts>
  /** A dry run: the price with these discounts, priced by pricing-api. 400 when a rule is broken. */
  quoteDiscounts?(organizationId: string, ids: string[]): Promise<DiscountQuote>
  /** accept_terms: the person agreed to give what each discount asks for (400 TERMS_NOT_ACCEPTED otherwise). */
  requestDiscounts?(
    organizationId: string,
    req: { ids: string[]; message?: string; accept_terms: boolean }
  ): Promise<Discounts>
  withdrawDiscountRequest?(organizationId: string, requestId: number): Promise<Discounts>
  // Optional: feature gates and paywalls (3.4i). Any member reads gates; billing roles start a
  // trial or buy an add-on. Without gates, <Paywall> and usePaywall stay out of the way.
  gates?(organizationId: string, q: { actions?: string[]; skus?: string[] }): Promise<Gates>
  gateEvent?(organizationId: string, e: { sku: string; event: PaywallEvent; choice?: PaywallOptionType }): Promise<void>
  /** Records what the person did with an intro (once shown, it never shows to them again in this organization). */
  gateIntro?(organizationId: string, e: { sku: string; action: IntroAction }): Promise<void>
  trials?(organizationId: string): Promise<{ trials: CustomerTrial[] }>
  /** Starts a free trial. continue and accept_auto_charge only when the person ticked it. */
  startTrial?(organizationId: string, req: TrialStartRequest): Promise<TrialStartResult>
  /** null turns the automatic continuation off. */
  setTrialContinue?(
    organizationId: string,
    trialId: number,
    cont: NonNullable<TrialStartRequest['continue']> | null,
    acceptAutoCharge?: boolean
  ): Promise<{ trial: CustomerTrial }>
  quoteAddon?(organizationId: string, req: { code: string; quantity?: number }): Promise<AddonPurchaseResult>
  /** Charges the card on file (prorated by Chargebee). idempotencyKey: one per review. */
  buyAddon?(
    organizationId: string,
    req: { code: string; quantity?: number },
    idempotencyKey: string
  ): Promise<AddonPurchaseResult>
}

export class BillingError extends Error {
  status: number
  code: string
  field?: string
  retryAfter?: number
  // Fields assigned in the body (not constructor parameter properties) so plain Node can load
  // the client in tests.
  constructor(status: number, code: string, message: string, field?: string, retryAfter?: number) {
    super(message)
    this.status = status
    this.code = code
    this.field = field
    this.retryAfter = retryAfter
  }
}

export interface ClientOptions {
  /** pricing-api, e.g. https://billing-api.qovery.com */
  pricingApiUrl: string
  /** The signed-in user's Qovery access token (the console already holds it). */
  getToken?: () => Promise<string> | string
  fetch?: typeof fetch
}

/** The query of a build usage read: the period, its grouping, and a service to drill into. */
export function buildUsageQuery(r: { from: string; to: string; granularity?: Granularity; service?: string }) {
  return new URLSearchParams({
    from: r.from,
    to: r.to,
    ...(r.granularity ? { granularity: r.granularity } : {}),
    ...(r.service !== undefined ? { service: r.service } : {}),
  }).toString()
}

/** The query of a gates read: actions and SKUs, comma separated. */
export function gatesQuery(q: { actions?: string[]; skus?: string[] }) {
  const p = new URLSearchParams()
  if (q.actions?.length) p.set('actions', q.actions.join(','))
  if (q.skus?.length) p.set('skus', q.skus.join(','))
  return p.toString()
}

export function createPricingClient(o: ClientOptions): PricingClient {
  const f = o.fetch ?? fetch.bind(globalThis)
  async function req<T>(base: string, path: string, init: RequestInit = {}, auth = true): Promise<T> {
    // Content-Type only with a body: a GET without it is a simple request, no CORS preflight.
    const headers: Record<string, string> = init.body != null ? { 'Content-Type': 'application/json' } : {}
    if (auth && o.getToken) headers.Authorization = `Bearer ${await o.getToken()}`
    const res = await f(base.replace(/\/$/, '') + path, {
      ...init,
      headers: { ...headers, ...(init.headers as Record<string, string>) },
    })
    const body = res.status === 204 ? null : await res.json().catch(() => null)
    if (!res.ok) {
      const retry = Number(res.headers?.get?.('Retry-After'))
      throw new BillingError(
        res.status,
        body?.code ?? 'ERROR',
        body?.detail ?? res.statusText,
        body?.field,
        Number.isFinite(retry) && retry > 0 ? retry : undefined
      )
    }
    return body as T
  }
  return {
    mode: 'live',
    publicPlans: () => req(o.pricingApiUrl, '/public/v1/plans', {}, false),
    async billingUsage(org) {
      const body = await req<BillingUsage>(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/billingUsage`)
      if (!billingUsageSchema.safeParse(body).success) {
        throw new BillingError(502, 'INVALID_RESPONSE', 'Invalid billing usage response')
      }
      return body
    },
    spendLimits: (org) => req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/spendLimits`),
    planOptions: (org) => req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/planOptions`),
    quotePlanChange: (org, plan, period) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/planChange`, {
        method: 'POST',
        body: JSON.stringify({ plan, period, dry_run: true }),
      }),
    changePlan: (org, plan, period, key) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/planChange`, {
        method: 'POST',
        body: JSON.stringify({ plan, period, dry_run: false }),
        headers: { 'Idempotency-Key': key },
      }),
    keepPlan: (org) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/planChange/scheduled`, { method: 'DELETE' }),
    keepSignupTrial: (org, keep, accept) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/signupTrial`, {
        method: 'PUT',
        body: JSON.stringify({ keep, accept_auto_charge: accept }),
      }),
    cancellation: (org) => req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/cancellation`),
    cancel: (org, r) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/cancellation`, {
        method: 'POST',
        body: JSON.stringify(r),
      }),
    keepSubscription: (org) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/cancellation`, { method: 'DELETE' }),
    credits: (org) => req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/credits`),
    quoteCredits: (org, r) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/credits`, {
        method: 'POST',
        body: JSON.stringify({ ...r, dry_run: true }),
      }),
    buyCredits: (org, r, key) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/credits`, {
        method: 'POST',
        body: JSON.stringify({ ...r, dry_run: false }),
        headers: { 'Idempotency-Key': key },
      }),
    reactivation: (org) => req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/reactivation`),
    quoteReactivation: (org, plan, period) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/reactivation`, {
        method: 'POST',
        body: JSON.stringify({ plan, period, dry_run: true }),
      }),
    reactivate: (org, plan, period, key) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/reactivation`, {
        method: 'POST',
        body: JSON.stringify({ plan, period, dry_run: false }),
        headers: { 'Idempotency-Key': key },
      }),
    usageHistory: (org, r) =>
      req(
        o.pricingApiUrl,
        `/organization/${encodeURIComponent(org)}/usageHistory?${new URLSearchParams({ from: r.from, to: r.to, ...(r.granularity ? { granularity: r.granularity } : {}) })}`
      ),
    buildUsage: (org, r) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/buildUsage?${buildUsageQuery(r)}`),
    offers: (org) => req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/offers`),
    offerEvent: (org, id, event, surface) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/offers/${id}/events`, {
        method: 'POST',
        body: JSON.stringify({ event, surface }),
      }),
    acceptOffer: (org, id) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/offers/${id}/accept`, { method: 'POST' }),
    requestUpgrade: (org, r) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/upgradeRequests`, {
        method: 'POST',
        body: JSON.stringify(r),
      }),
    closeUpgradeRequest: (org, id, status) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/upgradeRequests/${id}/close`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      }),
    proposals: (org) => req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/proposals`),
    viewProposal: (org, id) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/proposals/${id}/view`, { method: 'POST' }),
    snoozeProposal: (org, id, days) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/proposals/${id}/snooze`, {
        method: 'POST',
        body: JSON.stringify({ days }),
      }),
    dismissProposal: (org, id, r) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/proposals/${id}/dismiss`, {
        method: 'POST',
        body: JSON.stringify(r),
      }),
    quoteProposal: (org, id) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/proposals/${id}/accept`, {
        method: 'POST',
        body: JSON.stringify({ dry_run: true }),
      }),
    acceptProposal: (org, id, key) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/proposals/${id}/accept`, {
        method: 'POST',
        body: JSON.stringify({ dry_run: false }),
        headers: key ? { 'Idempotency-Key': key } : {},
      }),
    emailPreferences: (org) => req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/emailPreferences`),
    setEmailPreference: (org, category, enabled) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/emailPreferences`, {
        method: 'PUT',
        body: JSON.stringify({ category, enabled }),
      }),
    invoices: (org, page) => {
      const q = new URLSearchParams()
      if (page?.limit) q.set('limit', String(page.limit))
      if (page?.offset) q.set('offset', page.offset)
      return req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/invoices${q.size ? `?${q}` : ''}`)
    },
    invoice: (org, id) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/invoices/${encodeURIComponent(id)}`),
    invoicePdf: (org, id) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/invoices/${encodeURIComponent(id)}/pdf`),
    collectInvoice: (org, id, key) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/invoices/${encodeURIComponent(id)}/collect`, {
        method: 'POST',
        headers: { 'Idempotency-Key': key },
      }),
    paymentMethods: (org) => req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/paymentMethods`),
    paymentMethodSession: (org, redirectUrl) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/paymentMethods/session`, {
        method: 'POST',
        body: JSON.stringify(redirectUrl ? { redirect_url: redirectUrl } : {}),
      }),
    billingInfo: (org) => req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/billingInfo`),
    saveBillingInfo: (org, info) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/billingInfo`, {
        method: 'PUT',
        body: JSON.stringify(info),
      }),
    awsMarketplace: (org) => req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/awsMarketplace`),
    requestAwsOffer: (org, r) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/awsMarketplace/offerRequest`, {
        method: 'POST',
        body: JSON.stringify(r),
      }),
    discounts: (org) => req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/discounts`),
    quoteDiscounts: (org, ids) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/discounts/quote`, {
        method: 'POST',
        body: JSON.stringify({ ids, dry_run: true }),
      }),
    requestDiscounts: (org, r) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/discountRequests`, {
        method: 'POST',
        body: JSON.stringify({ ids: r.ids, message: r.message ?? '', accept_terms: r.accept_terms }),
      }),
    withdrawDiscountRequest: (org, id) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/discountRequests/${id}`, { method: 'DELETE' }),
    gates: (org, q) => req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/gates?${gatesQuery(q)}`),
    gateEvent: (org, e) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/gates/events`, {
        method: 'POST',
        body: JSON.stringify(e),
      }),
    gateIntro: (org, e) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/gates/intro`, {
        method: 'POST',
        body: JSON.stringify(e),
      }),
    trials: (org) => req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/trials`),
    startTrial: (org, r) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/trials`, {
        method: 'POST',
        body: JSON.stringify(r),
      }),
    setTrialContinue: (org, id, cont, accept) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/trials/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cont ? { continue: cont, accept_auto_charge: !!accept } : { continue: null }),
      }),
    quoteAddon: (org, r) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/addons`, {
        method: 'POST',
        body: JSON.stringify({ ...r, dry_run: true }),
      }),
    buyAddon: (org, r, key) =>
      req(o.pricingApiUrl, `/organization/${encodeURIComponent(org)}/addons`, {
        method: 'POST',
        body: JSON.stringify({ ...r, dry_run: false }),
        headers: { 'Idempotency-Key': key },
      }),
  }
}
