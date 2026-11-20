/*
 * The billing kit's data source: pricing-api's customer API with the user's Qovery token. Plan
 * changes, cancellation, reactivation, prepaid credits and usage history included: core relays
 * none of it. The back office
 * passes its own client (staff previews, nothing applied).
 */
import type {
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
  EmailPreferences,
  Granularity,
  InvoiceDetails,
  InvoiceDownload,
  InvoicePage,
  Offers,
  PaymentMethods,
  PaymentSession,
  Period,
  PlanChangeResult,
  PlanOptions,
  PublicPlans,
  Reactivation,
  ReactivationResult,
  Spend,
  Trial,
  UpgradeRequest,
  UsageHistoryData,
} from './types'

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
  changePlan?(organizationId: string, plan: string, period?: Period, idempotencyKey?: string): Promise<PlanChangeResult>
  /** "Keep my current plan": drops the change scheduled for the renewal. */
  keepPlan?(organizationId: string): Promise<{ removed: boolean }>
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
  requestUpgrade?(
    organizationId: string,
    req: { sku?: string; plan_code?: string; message?: string }
  ): Promise<{ request: UpgradeRequest; notified: number; existing?: boolean }>
  closeUpgradeRequest?(organizationId: string, requestId: number, status: 'done' | 'declined'): Promise<void>
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
  collectInvoice?(organizationId: string, invoiceId: string): Promise<CustomerInvoice>
  paymentMethods?(organizationId: string): Promise<PaymentMethods>
  /** Chargebee's page to add or replace a card. redirectUrl is used only when it is a Qovery origin. */
  paymentMethodSession?(organizationId: string, redirectUrl?: string): Promise<PaymentSession>
  billingInfo?(organizationId: string): Promise<BillingInfoView>
  saveBillingInfo?(organizationId: string, info: BillingInfo): Promise<BillingInfoView>
  awsMarketplace?(organizationId: string): Promise<AwsMarketplace>
  requestAwsOffer?(organizationId: string, req: { aws_account_id: string; message?: string }): Promise<AwsMarketplace>
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
    billingUsage: (org) => req(o.pricingApiUrl, `/organization/${org}/billingUsage`),
    spendLimits: (org) => req(o.pricingApiUrl, `/organization/${org}/spendLimits`),
    planOptions: (org) => req(o.pricingApiUrl, `/organization/${org}/planOptions`),
    quotePlanChange: (org, plan, period) =>
      req(o.pricingApiUrl, `/organization/${org}/planChange`, {
        method: 'POST',
        body: JSON.stringify({ plan, period, dry_run: true }),
      }),
    changePlan: (org, plan, period, key) =>
      req(o.pricingApiUrl, `/organization/${org}/planChange`, {
        method: 'POST',
        body: JSON.stringify({ plan, period, dry_run: false }),
        headers: key ? { 'Idempotency-Key': key } : {},
      }),
    keepPlan: (org) => req(o.pricingApiUrl, `/organization/${org}/planChange/scheduled`, { method: 'DELETE' }),
    cancellation: (org) => req(o.pricingApiUrl, `/organization/${org}/cancellation`),
    cancel: (org, r) =>
      req(o.pricingApiUrl, `/organization/${org}/cancellation`, { method: 'POST', body: JSON.stringify(r) }),
    keepSubscription: (org) => req(o.pricingApiUrl, `/organization/${org}/cancellation`, { method: 'DELETE' }),
    credits: (org) => req(o.pricingApiUrl, `/organization/${org}/credits`),
    quoteCredits: (org, r) =>
      req(o.pricingApiUrl, `/organization/${org}/credits`, {
        method: 'POST',
        body: JSON.stringify({ ...r, dry_run: true }),
      }),
    buyCredits: (org, r, key) =>
      req(o.pricingApiUrl, `/organization/${org}/credits`, {
        method: 'POST',
        body: JSON.stringify({ ...r, dry_run: false }),
        headers: { 'Idempotency-Key': key },
      }),
    reactivation: (org) => req(o.pricingApiUrl, `/organization/${org}/reactivation`),
    quoteReactivation: (org, plan, period) =>
      req(o.pricingApiUrl, `/organization/${org}/reactivation`, {
        method: 'POST',
        body: JSON.stringify({ plan, period, dry_run: true }),
      }),
    reactivate: (org, plan, period, key) =>
      req(o.pricingApiUrl, `/organization/${org}/reactivation`, {
        method: 'POST',
        body: JSON.stringify({ plan, period, dry_run: false }),
        headers: { 'Idempotency-Key': key },
      }),
    usageHistory: (org, r) =>
      req(
        o.pricingApiUrl,
        `/organization/${org}/usageHistory?${new URLSearchParams({ from: r.from, to: r.to, ...(r.granularity ? { granularity: r.granularity } : {}) })}`
      ),
    buildUsage: (org, r) => req(o.pricingApiUrl, `/organization/${org}/buildUsage?${buildUsageQuery(r)}`),
    offers: (org) => req(o.pricingApiUrl, `/organization/${org}/offers`),
    offerEvent: (org, id, event, surface) =>
      req(o.pricingApiUrl, `/organization/${org}/offers/${id}/events`, {
        method: 'POST',
        body: JSON.stringify({ event, surface }),
      }),
    acceptOffer: (org, id) => req(o.pricingApiUrl, `/organization/${org}/offers/${id}/accept`, { method: 'POST' }),
    requestUpgrade: (org, r) =>
      req(o.pricingApiUrl, `/organization/${org}/upgradeRequests`, { method: 'POST', body: JSON.stringify(r) }),
    closeUpgradeRequest: (org, id, status) =>
      req(o.pricingApiUrl, `/organization/${org}/upgradeRequests/${id}/close`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      }),
    emailPreferences: (org) => req(o.pricingApiUrl, `/organization/${org}/emailPreferences`),
    setEmailPreference: (org, category, enabled) =>
      req(o.pricingApiUrl, `/organization/${org}/emailPreferences`, {
        method: 'PUT',
        body: JSON.stringify({ category, enabled }),
      }),
    invoices: (org, page) => {
      const q = new URLSearchParams()
      if (page?.limit) q.set('limit', String(page.limit))
      if (page?.offset) q.set('offset', page.offset)
      return req(o.pricingApiUrl, `/organization/${org}/invoices${q.size ? `?${q}` : ''}`)
    },
    invoice: (org, id) => req(o.pricingApiUrl, `/organization/${org}/invoices/${encodeURIComponent(id)}`),
    invoicePdf: (org, id) => req(o.pricingApiUrl, `/organization/${org}/invoices/${encodeURIComponent(id)}/pdf`),
    collectInvoice: (org, id) =>
      req(o.pricingApiUrl, `/organization/${org}/invoices/${encodeURIComponent(id)}/collect`, { method: 'POST' }),
    paymentMethods: (org) => req(o.pricingApiUrl, `/organization/${org}/paymentMethods`),
    paymentMethodSession: (org, redirectUrl) =>
      req(o.pricingApiUrl, `/organization/${org}/paymentMethods/session`, {
        method: 'POST',
        body: JSON.stringify(redirectUrl ? { redirect_url: redirectUrl } : {}),
      }),
    billingInfo: (org) => req(o.pricingApiUrl, `/organization/${org}/billingInfo`),
    saveBillingInfo: (org, info) =>
      req(o.pricingApiUrl, `/organization/${org}/billingInfo`, { method: 'PUT', body: JSON.stringify(info) }),
    awsMarketplace: (org) => req(o.pricingApiUrl, `/organization/${org}/awsMarketplace`),
    requestAwsOffer: (org, r) =>
      req(o.pricingApiUrl, `/organization/${org}/awsMarketplace/offerRequest`, {
        method: 'POST',
        body: JSON.stringify(r),
      }),
  }
}
