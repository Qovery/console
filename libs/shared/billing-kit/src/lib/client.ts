/*
 * The billing kit's data source. Reads come from pricing-api with the user's Qovery token; plan
 * changes go through core, which checks the user's billing rights and relays to pricing-api.
 * The back office passes its own client (staff previews, nothing applied).
 */
import type {
  AwsMarketplace,
  BillingInfo,
  BillingInfoView,
  BillingUsage,
  CustomerInvoice,
  EmailPreferences,
  InvoiceDownload,
  InvoicePage,
  Offers,
  PaymentMethods,
  PaymentSession,
  Period,
  PlanChangeResult,
  PlanOptions,
  PublicPlans,
  Spend,
  Trial,
  UpgradeRequest,
} from './types'

export interface PricingClient {
  /** "live" applies plan changes; "preview" only quotes them (staff previews, demos). */
  mode: 'live' | 'preview'
  publicPlans(): Promise<PublicPlans>
  billingUsage(organizationId: string): Promise<BillingUsage>
  spendLimits(organizationId: string): Promise<Spend>
  // Optional in the console copy: without them, <UsagePage> hides Compare plans and Change plan.
  planOptions?(organizationId: string): Promise<PlanOptions>
  quotePlanChange?(organizationId: string, plan: string, period?: Period): Promise<PlanChangeResult>
  changePlan?(organizationId: string, plan: string, period?: Period): Promise<PlanChangeResult>
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
  constructor(
    public status: number,
    public code: string,
    message: string,
    public field?: string,
    public retryAfter?: number
  ) {
    super(message)
  }
}

export interface ClientOptions {
  /** pricing-api, e.g. https://billing-api.qovery.com */
  pricingApiUrl: string
  /** core, e.g. https://api.qovery.com (plan changes) */
  coreApiUrl?: string
  /** The signed-in user's Qovery access token (the console already holds it). */
  getToken?: () => Promise<string> | string
  /** Core's routes for the plan picker and plan changes, relayed to pricing-api. */
  corePaths?: { planOptions: (org: string) => string; planChange: (org: string) => string }
  fetch?: typeof fetch
}

const defaultCorePaths = {
  planOptions: (org: string) => `/organization/${org}/planOptions`,
  planChange: (org: string) => `/organization/${org}/planChange`,
}

export function createPricingClient(o: ClientOptions): PricingClient {
  const f = o.fetch ?? fetch.bind(globalThis)
  const paths = o.corePaths ?? defaultCorePaths
  async function req<T>(base: string, path: string, init: RequestInit = {}, auth = true): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
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
  const core = o.coreApiUrl ?? o.pricingApiUrl
  return {
    mode: 'live',
    publicPlans: () => req(o.pricingApiUrl, '/public/v1/plans', {}, false),
    billingUsage: (org) => req(o.pricingApiUrl, `/organization/${org}/billingUsage`),
    spendLimits: (org) => req(o.pricingApiUrl, `/organization/${org}/spendLimits`),
    planOptions: (org) => req(core, paths.planOptions(org)),
    quotePlanChange: (org, plan, period) =>
      req(core, paths.planChange(org), { method: 'POST', body: JSON.stringify({ plan, period, dry_run: true }) }),
    changePlan: (org, plan, period) =>
      req(core, paths.planChange(org), { method: 'POST', body: JSON.stringify({ plan, period, dry_run: false }) }),
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
