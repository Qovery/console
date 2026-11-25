/*
 * The billing kit's data source: pricing-api's customer API with the user's Qovery token. Plan
 * changes, cancellation, reactivation, prepaid credits and usage history included: core relays
 * none of it. The back office
 * passes its own client (staff previews, nothing applied).
 */
import { z } from 'zod'
import { BillingError, billingData, createBillingApi } from './pricing-transport'
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

export { BillingError } from './pricing-transport'

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

export function createPricingClient(options: ClientOptions): PricingClient {
  const api = createBillingApi(options)
  return {
    mode: 'live',
    publicPlans: () => billingData(api.publicPlans()),
    async billingUsage(organizationId) {
      const data = await billingData<BillingUsage>(api.billingUsage({ organizationId }))
      if (!billingUsageSchema.safeParse(data).success) {
        throw new BillingError(502, 'INVALID_RESPONSE', 'Invalid billing usage response')
      }
      return data
    },
    spendLimits: (org) => billingData(api.spendLimits({ organizationId: org })),
    planOptions: (org) => billingData(api.planOptions({ organizationId: org })),
    quotePlanChange: (org, plan, period) =>
      billingData(api.changePlan({ organizationId: org, changePlanRequest: { plan, period, dry_run: true } })),
    changePlan: (org, plan, period, idempotencyKey) =>
      billingData(
        api.changePlan({ organizationId: org, changePlanRequest: { plan, period, dry_run: false }, idempotencyKey })
      ),
    keepPlan: (org) => billingData(api.keepPlan({ organizationId: org })),
    keepSignupTrial: (org, keep, accept) =>
      billingData(
        api.keepSignupTrial({ organizationId: org, keepSignupTrialRequest: { keep, accept_auto_charge: accept } })
      ),
    cancellation: (org) => billingData(api.cancellation({ organizationId: org })),
    cancel: (org, request) => billingData(api.cancel({ organizationId: org, cancelRequest: request })),
    keepSubscription: (org) => billingData(api.keepSubscription({ organizationId: org })),
    credits: (org) => billingData(api.credits({ organizationId: org })),
    quoteCredits: (org, request) =>
      billingData(api.buyCredits({ organizationId: org, buyCreditsRequest: { ...request, dry_run: true } })),
    buyCredits: (org, request, idempotencyKey) =>
      billingData(
        api.buyCredits({ organizationId: org, buyCreditsRequest: { ...request, dry_run: false }, idempotencyKey })
      ),
    reactivation: (org) => billingData(api.reactivation({ organizationId: org })),
    quoteReactivation: (org, plan, period) =>
      billingData(api.reactivate({ organizationId: org, reactivateRequest: { plan, period, dry_run: true } })),
    reactivate: (org, plan, period, idempotencyKey) =>
      billingData(
        api.reactivate({ organizationId: org, reactivateRequest: { plan, period, dry_run: false }, idempotencyKey })
      ),
    usageHistory: (org, range) => billingData(api.usageHistory({ organizationId: org, ...range })),
    buildUsage: (org, range) => billingData(api.buildUsage({ organizationId: org, ...range })),
    offers: (org) => billingData(api.offers({ organizationId: org })),
    offerEvent: (org, id, event, surface) =>
      billingData(api.offerEvent({ organizationId: org, offerId: id, offerEventRequest: { event, surface } })),
    acceptOffer: (org, id) => billingData(api.acceptOffer({ organizationId: org, offerId: id })),
    requestUpgrade: (org, request) =>
      billingData(api.requestUpgrade({ organizationId: org, requestUpgradeRequest: request })),
    closeUpgradeRequest: (org, id, status) =>
      billingData(
        api.closeUpgradeRequest({ organizationId: org, requestId: id, closeUpgradeRequestRequest: { status } })
      ),
    proposals: (org) => billingData(api.proposals({ organizationId: org })),
    viewProposal: (org, id) => billingData(api.viewProposal({ organizationId: org, proposalId: id })),
    snoozeProposal: (org, id, days) =>
      billingData(api.snoozeProposal({ organizationId: org, proposalId: id, snoozeProposalRequest: { days } })),
    dismissProposal: (org, id, request) =>
      billingData(api.dismissProposal({ organizationId: org, proposalId: id, dismissProposalRequest: request })),
    quoteProposal: (org, id) =>
      billingData(
        api.acceptProposal({ organizationId: org, proposalId: id, acceptProposalRequest: { dry_run: true } })
      ),
    acceptProposal: (org, id, idempotencyKey) =>
      billingData(
        api.acceptProposal({
          organizationId: org,
          proposalId: id,
          acceptProposalRequest: { dry_run: false },
          idempotencyKey,
        })
      ),
    emailPreferences: (org) => billingData(api.emailPreferences({ organizationId: org })),
    setEmailPreference: (org, category, enabled) =>
      billingData(api.setEmailPreference({ organizationId: org, setEmailPreferenceRequest: { category, enabled } })),
    invoices: (org, page) =>
      billingData(
        api.invoices({ organizationId: org, limit: page?.limit || undefined, offset: page?.offset || undefined })
      ),
    invoice: (org, id) => billingData(api.invoice({ organizationId: org, invoiceId: id })),
    invoicePdf: (org, id) => billingData(api.invoicePdf({ organizationId: org, invoiceId: id })),
    collectInvoice: (org, invoiceId, idempotencyKey) =>
      billingData(api.collectInvoice({ organizationId: org, invoiceId, idempotencyKey })),
    paymentMethods: (org) => billingData(api.paymentMethods({ organizationId: org })),
    paymentMethodSession: (org, redirectUrl) =>
      billingData(
        api.paymentMethodSession({
          organizationId: org,
          paymentMethodSessionRequest: redirectUrl ? { redirect_url: redirectUrl } : {},
        })
      ),
    billingInfo: (org) => billingData(api.billingInfo({ organizationId: org })),
    saveBillingInfo: (org, request) => billingData(api.saveBillingInfo({ organizationId: org, body: request })),
    awsMarketplace: (org) => billingData(api.awsMarketplace({ organizationId: org })),
    requestAwsOffer: (org, request) =>
      billingData(api.requestAwsOffer({ organizationId: org, requestAwsOfferRequest: request })),
    discounts: (org) => billingData(api.discounts({ organizationId: org })),
    quoteDiscounts: (org, ids) =>
      billingData(api.quoteDiscounts({ organizationId: org, quoteDiscountsRequest: { ids, dry_run: true } })),
    requestDiscounts: (org, request) =>
      billingData(
        api.requestDiscounts({
          organizationId: org,
          requestDiscountsRequest: { ...request, message: request.message ?? '' },
        })
      ),
    withdrawDiscountRequest: (org, id) =>
      billingData(api.withdrawDiscountRequest({ organizationId: org, requestId: id })),
    gates: (org, { actions, skus }) =>
      billingData(
        api.gates({ organizationId: org, actions: actions?.join(',') || undefined, skus: skus?.join(',') || undefined })
      ),
    gateEvent: (org, request) => billingData(api.gateEvent({ organizationId: org, gateEventRequest: request })),
    gateIntro: (org, request) => billingData(api.gateIntro({ organizationId: org, gateIntroRequest: request })),
    trials: (org) => billingData(api.trials({ organizationId: org })),
    startTrial: (org, request) => billingData(api.startTrial({ organizationId: org, body: request })),
    setTrialContinue: (org, trialId, continuation, accept) =>
      billingData(
        api.setTrialContinue({
          organizationId: org,
          trialId,
          setTrialContinueRequest: continuation
            ? { continue: continuation, accept_auto_charge: !!accept }
            : { continue: null },
        })
      ),
    quoteAddon: (org, request) =>
      billingData(api.buyAddon({ organizationId: org, buyAddonRequest: { ...request, dry_run: true } })),
    buyAddon: (org, request, idempotencyKey) =>
      billingData(
        api.buyAddon({ organizationId: org, buyAddonRequest: { ...request, dry_run: false }, idempotencyKey })
      ),
  }
}
