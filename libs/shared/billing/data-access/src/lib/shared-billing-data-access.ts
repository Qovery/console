import { createQueryKeys } from '@lukemorales/query-key-factory'
import axios, { type AxiosResponse } from 'axios'
import {
  type AcceptOfferResponse,
  type AddonPurchaseResult,
  type AwsMarketplace,
  BillingApi,
  type BillingApiBuildUsageRequest,
  type BillingApiInvoicesRequest,
  type BillingApiUsageHistoryRequest,
  type BillingInfo,
  type BillingInfoView,
  type BillingProblem,
  type BillingUsage,
  type BuildUsageData,
  type BuyAddonRequest,
  type BuyCreditsRequest,
  type CancelRequest,
  type Cancellation,
  type CancellationResult,
  type CloseUpgradeRequestRequest,
  Configuration,
  type CreditPurchaseResult,
  type Credits,
  type CustomerInvoice,
  type CustomerTrial,
  type DiscountQuote,
  type Discounts,
  type DismissProposalRequest,
  type DismissProposalResponse,
  type EmailPreferences,
  type GateEventRequest,
  type GateIntroRequest,
  type Gates,
  type InvoiceDetails,
  type InvoiceDownload,
  type InvoicePage,
  type KeepPlanResponse,
  type KeepSignupTrialResponse,
  type OfferEventRequest,
  type Offers,
  type PaymentMethods,
  type PaymentSession,
  type Period,
  type PlanChangeResult,
  type PlanOptions,
  type Proposals,
  type PublicPlans,
  type Reactivation,
  type ReactivationResult,
  type RequestAwsOfferRequest,
  type RequestDiscountsRequest,
  type RequestUpgradeRequest,
  type RequestUpgradeResponse,
  type SetTrialContinueRequest,
  type SnoozeProposalResponse,
  type Spend,
  type TrialStartRequest,
  type TrialStartResult,
  type UsageHistoryData,
} from 'qovery-pricing-typescript-axios'
import { z } from 'zod'

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
  keepPlan?(organizationId: string): Promise<KeepPlanResponse>
  /** A new organization's trial: keep its plan at the end (with the consent, a card on file), or stop keeping it. */
  keepSignupTrial?(organizationId: string, keep: boolean, acceptAutoCharge: boolean): Promise<KeepSignupTrialResponse>
  // Optional: cancellation at the end of the term (billing roles only).
  cancellation?(organizationId: string): Promise<Cancellation>
  cancel?(organizationId: string, req: CancelRequest): Promise<CancellationResult>
  /** Undoes a scheduled cancellation, or withdraws a request. */
  keepSubscription?(organizationId: string): Promise<CancellationResult>
  // Optional: prepaid credits (billing roles). Without them, members and hosts see balances only.
  credits?(organizationId: string): Promise<Credits>
  quoteCredits?(organizationId: string, req: Omit<BuyCreditsRequest, 'dry_run'>): Promise<CreditPurchaseResult>
  /** Charges the card on file now. idempotencyKey: one per review. 402 PAYMENT_FAILED adds nothing. */
  buyCredits?(
    organizationId: string,
    req: Omit<BuyCreditsRequest, 'dry_run'>,
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
    range: Omit<BillingApiUsageHistoryRequest, 'organizationId'>
  ): Promise<UsageHistoryData>
  // Optional: build usage over a period, per builder size and service (any member; costs for
  // billing roles). service: one service's builds ("" = the time not attributed to a service).
  buildUsage?(
    organizationId: string,
    range: Omit<BillingApiBuildUsageRequest, 'organizationId'>
  ): Promise<BuildUsageData>
  // Optional: offers and upgrade requests (OfferHost, "Ask an admin") and email preferences.
  offers?(organizationId: string): Promise<Offers>
  offerEvent?(
    organizationId: string,
    offerId: number,
    event: OfferEventRequest['event'],
    surface: OfferEventRequest['surface']
  ): Promise<void>
  /** Accepts a trial offer: the trial starts at once (billing roles only). */
  acceptOffer?(organizationId: string, offerId: number): Promise<AcceptOfferResponse>
  /** source "paywall": asked from a paywall (counted in its funnel). */
  requestUpgrade?(organizationId: string, req: RequestUpgradeRequest): Promise<RequestUpgradeResponse>
  closeUpgradeRequest?(
    organizationId: string,
    requestId: number,
    status: CloseUpgradeRequestRequest['status']
  ): Promise<void>
  // Optional: plan proposals Qovery staff send (billing roles; members get { proposal: null }).
  // Review quotes and accepts through the plan change rules, with the proposal's concession.
  proposals?(organizationId: string): Promise<Proposals>
  viewProposal?(organizationId: string, proposalId: number): Promise<void>
  /** Remind me later: the banner comes back after `days` (3, 7 or 14) with a reminder email. */
  snoozeProposal?(organizationId: string, proposalId: number, days: number): Promise<SnoozeProposalResponse>
  dismissProposal?(
    organizationId: string,
    proposalId: number,
    req: DismissProposalRequest
  ): Promise<DismissProposalResponse>
  quoteProposal?(organizationId: string, proposalId: number): Promise<PlanChangeResult>
  /** idempotencyKey: one per review, as for a plan change. */
  acceptProposal?(organizationId: string, proposalId: number, idempotencyKey?: string): Promise<PlanChangeResult>
  emailPreferences?(organizationId: string): Promise<EmailPreferences>
  setEmailPreference?(organizationId: string, category: string, enabled: boolean): Promise<EmailPreferences>
  // Optional: the customer's own billing (billing roles only). Invoices, payment methods and
  // billing information live in Chargebee; pricing-api reads and writes them for the organization.
  invoices?(organizationId: string, page?: Omit<BillingApiInvoicesRequest, 'organizationId'>): Promise<InvoicePage>
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
  requestAwsOffer?(organizationId: string, req: RequestAwsOfferRequest): Promise<AwsMarketplace>
  // Optional: discounts in exchange for counterparts (billing roles). A request is reviewed by
  // Qovery; nothing changes on the subscription until it is approved.
  discounts?(organizationId: string): Promise<Discounts>
  /** A dry run: the price with these discounts, priced by pricing-api. 400 when a rule is broken. */
  quoteDiscounts?(organizationId: string, ids: string[]): Promise<DiscountQuote>
  /** accept_terms: the person agreed to give what each discount asks for (400 TERMS_NOT_ACCEPTED otherwise). */
  requestDiscounts?(organizationId: string, req: RequestDiscountsRequest): Promise<Discounts>
  withdrawDiscountRequest?(organizationId: string, requestId: number): Promise<Discounts>
  // Optional: feature gates and paywalls (3.4i). Any member reads gates; billing roles start a
  // trial or buy an add-on. Without gates, <Paywall> and usePaywall stay out of the way.
  gates?(organizationId: string, q: { actions?: string[]; skus?: string[] }): Promise<Gates>
  gateEvent?(organizationId: string, e: GateEventRequest): Promise<void>
  /** Records what the person did with an intro (once shown, it never shows to them again in this organization). */
  gateIntro?(organizationId: string, e: GateIntroRequest): Promise<void>
  trials?(organizationId: string): Promise<{ trials: CustomerTrial[] }>
  /** Starts a free trial. continue and accept_auto_charge only when the person ticked it. */
  startTrial?(organizationId: string, req: TrialStartRequest): Promise<TrialStartResult>
  /** null turns the automatic continuation off. */
  setTrialContinue?(
    organizationId: string,
    trialId: number,
    cont: NonNullable<SetTrialContinueRequest['continue']> | null,
    acceptAutoCharge?: boolean
  ): Promise<{ trial: CustomerTrial }>
  quoteAddon?(organizationId: string, req: Omit<BuyAddonRequest, 'dry_run'>): Promise<AddonPurchaseResult>
  /** Charges the card on file (prorated by Chargebee). idempotencyKey: one per review. */
  buyAddon?(
    organizationId: string,
    req: Omit<BuyAddonRequest, 'dry_run'>,
    idempotencyKey: string
  ): Promise<AddonPurchaseResult>
}

interface PricingClientOptions {
  /** pricing-api, e.g. https://billing-api.qovery.com */
  pricingApiUrl: string
  /** The signed-in user's Qovery access token (the console already holds it). */
  getToken?: () => Promise<string> | string
}

async function billingData<T>(request: Promise<AxiosResponse<T>>): Promise<T> {
  const { status, statusText, data, headers } = await request
  if (status >= 200 && status < 300) return data

  const body = data as Partial<BillingProblem> | null
  const retry = Number(headers['retry-after'])
  throw new BillingError(
    status,
    body?.code ?? 'ERROR',
    body?.detail ?? statusText,
    body?.field,
    Number.isFinite(retry) && retry > 0 ? retry : undefined
  )
}

export function createPricingClient({ pricingApiUrl, getToken }: PricingClientOptions): PricingClient {
  const basePath = pricingApiUrl.replace(/\/$/, '')
  const configuration = new Configuration({ basePath, accessToken: getToken ? async () => getToken() : undefined })
  const api = new BillingApi(configuration, basePath, axios.create({ baseURL: basePath, validateStatus: () => true }))
  return {
    mode: 'live',
    publicPlans: () => billingData(api.publicPlans()),
    async billingUsage(organizationId) {
      const data = await billingData(api.billingUsage({ organizationId }))
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

type BillingRead = { client: PricingClient; organizationId: string }

const billingClientIds = new WeakMap<PricingClient, number>()
let nextBillingClientId = 0

function billingClientId(client: PricingClient): number {
  const existing = billingClientIds.get(client)
  if (existing !== undefined) return existing
  const id = nextBillingClientId++
  billingClientIds.set(client, id)
  return id
}

export const billing = createQueryKeys('billing', {
  usage: ({ client, organizationId }: BillingRead) => ({
    queryKey: [billingClientId(client), organizationId],
    queryFn: () => client.billingUsage(organizationId),
  }),
  emailPreferences: ({ client, organizationId }: BillingRead) => ({
    queryKey: [billingClientId(client), organizationId],
    queryFn: async () => (await client.emailPreferences?.(organizationId)) ?? null,
  }),
  proposals: ({ client, organizationId }: BillingRead) => ({
    queryKey: [billingClientId(client), organizationId],
    async queryFn() {
      try {
        return (await client.proposals?.(organizationId)) ?? { proposal: null }
      } catch (error) {
        if (error instanceof BillingError && error.code === 'ORGANIZATION_NOT_LINKED') return { proposal: null }
        throw error
      }
    },
  }),
  proposalView: ({ client, organizationId, proposalId }: BillingRead & { proposalId?: number }) => ({
    queryKey: [billingClientId(client), organizationId, proposalId],
    async queryFn() {
      if (proposalId !== undefined) await client.viewProposal?.(organizationId, proposalId)
      return true
    },
  }),
  invoice: ({ client, organizationId, invoiceId }: BillingRead & { invoiceId: string }) => ({
    queryKey: [billingClientId(client), organizationId, invoiceId],
    queryFn: async () => (await client.invoice?.(organizationId, invoiceId)) ?? null,
  }),
  invoices: ({ client, organizationId }: BillingRead) => ({
    queryKey: [billingClientId(client), organizationId],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      (pageParam ? client.invoices?.(organizationId, { offset: pageParam }) : client.invoices?.(organizationId)) ??
      Promise.reject(new Error('Invoices are unavailable')),
  }),
})
