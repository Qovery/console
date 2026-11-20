/*
 * The shapes the billing kit reads. They mirror pricing-api's responses (docs/INTEGRATION.md):
 * GET /public/v1/plans, GET /organization/{id}/billingUsage, /spendLimits, /planOptions, /planChange,
 * /cancellation, /usageHistory, /credits, /reactivation, invoices and payment details. Amounts are cents of `currency`.
 */
export type Value = number | boolean | 'unlimited'
export type Period = 'month' | 'year'
export interface Price {
  currency: string
  period: Period
  amount: number
}

// ---- the website's plans (GET /public/v1/plans)
export interface PublicEntitlement {
  sku: string
  name: string
  description?: string
  kind: 'feature' | 'limit' | 'meter'
  unit?: string
  value: Value
  overage_unit_price?: Record<string, number>
  preview?: boolean
}
export interface PublicAddon {
  code: string
  name: string
  description?: string
  gives: { sku: string; name: string; adds?: number; enable?: boolean }[]
  prices: Price[]
}
export interface PublicPlan {
  code: string
  name: string
  description: string
  rank: number
  version: number
  contact_sales: boolean
  free?: boolean
  draft?: boolean
  prices: Price[]
  yearly_saving: { currency: string; monthly_x12: number; yearly: number; saving_pct: number }[]
  published_at?: string
  support: string
  entitlements: PublicEntitlement[]
  addons: PublicAddon[]
}
export interface PublicPlans {
  plans: PublicPlan[]
  currencies: string[]
  builders?: PublicBuilders
}

// ---- one organization (GET /organization/{id}/billingUsage)
export interface Entitlement {
  sku: string
  name: string
  kind: 'feature' | 'limit' | 'meter'
  unit: string
  value: Value
  used: number
  mode: 'hard' | 'soft' | 'notify' | 'shadow'
  over: boolean
  customer_note: string
  lifecycle: string
  overage_unit_price: number
  prepaid?: number
}
export interface EstimateLine {
  kind: string
  label: string
  quantity: number
  unit_amount: number
  amount: number
  note?: string
  sku?: string
  meter?: boolean
}
export interface Estimate {
  plan: string
  currency: string
  period: Period
  term_end: string
  lines: EstimateLine[]
  total: number
}
export interface DeploymentDay {
  day: string
  deployments: number
  failed: number
  build_minutes: number
  deploy_minutes: number
  minutes: number
  over_minutes: number
  cost: number
}
export interface SpendScope {
  scope: 'account' | 'organization' | 'sku'
  scope_id: string
  name: string
  spent: number
  monthly_limit: number | null
  used_pct?: number
  thresholds: number[]
  reached: number[]
  editable: boolean
  prepaid?: boolean
  unit?: string
}
export interface Spend {
  month: string
  resets_at: string
  currency: string
  spent: number
  projected: number
  account: SpendScope
  organizations: SpendScope[]
  skus: SpendScope[]
  suggestions: { label: string; add: number; new_limit: number }[]
}
export interface BillingUsage {
  organization_id: string
  generated_at: string
  access: 'member' | 'billing' | 'demo'
  plan: { code: string; name: string; version: number; legacy: boolean }
  billing: {
    period: Period
    cadence: 'annual' | 'committed' | 'monthly'
    currency: string
    term_start: string
    term_end: string
    status: string
    phase?: { kind: string; until: string; on_end: string }
    locked: boolean
  }
  entitlements: Entitlement[]
  organization_usage: Record<string, number>
  deployments: {
    from: string
    to: string
    deployments: number
    build_minutes: number
    deploy_minutes: number
    days: DeploymentDay[]
  }
  prepaid_credits: {
    sku: string
    name: string
    unit: string
    balance: number
    remaining: number
    unit_price?: number
  }[]
  /** How build time counts by builder size; price_per_minute (cents, billing roles) beyond the plan. */
  builder_sizes?: BuilderSize[]
  estimate?: Estimate
  spend?: Spend
  usage_insights?: UsageInsights
  status: { status: 'ok' | 'payment_failed' | 'locked'; grace_until?: string; message?: string }
  notes: string[]
}

/** A builder size. Listed sizes show on the pricing page and in the picker; the others are on request. saving: % less than its resources (big builders). */
export interface BuilderSize {
  code: string
  name: string
  description?: string
  max_cpu_milli: number
  max_ram_gib: number
  multiplier: number
  listed?: boolean
  saving?: number
  price_per_minute?: number
  prepaid_per_minute?: number
}
export interface PublicBuilders {
  annual_prepaid_discount_pct: number
  sizes: BuilderSize[]
}

// ---- usage over time (billingUsage.usage_insights)
export interface UsageSeries {
  sku: string
  name: string
  unit: string
  kind: 'limit' | 'meter'
  /** Limits: the allowance at any time. Meters: the allowance per month. Absent when unlimited. */
  included?: number
  source: 'deployments' | 'billed' | 'snapshot'
  points: { day: string; quantity: number }[]
}
export interface DeploymentMonth {
  month: string
  deployments: number
  build_minutes: number
  deploy_minutes: number
  build_billed_minutes?: number
  minutes: number
  included: number | null
  over_minutes: number
  cost: number
}
export interface UsageProjection {
  sku: string
  name: string
  unit: string
  used: number
  included?: number
  projected: number
  projected_over: number
  projected_cost?: number
  days_elapsed: number
  days_in_month: number
  daily_pace: number
}
export interface UsageValue {
  currency: string
  monthly_fee: number
  included_value: number
  used_value: number
  lines: {
    sku: string
    name: string
    unit: string
    used: number
    included: number
    unit_price: number
    included_value: number
    used_value: number
  }[]
  per_unit: { label: string; sku: string; count: number; amount: number }[]
}
export interface UsageInsights {
  from: string
  to: string
  series: UsageSeries[]
  deployment_months: DeploymentMonth[]
  projection: UsageProjection[]
  value?: UsageValue
}

// ---- offers, upgrade requests, email preferences (GET /organization/{id}/offers …)
export type OfferSurface = 'banner' | 'modal'
export interface OfferAction {
  type: 'upgrade' | 'annualize' | 'addon' | 'contact_sales' | 'url' | 'trial'
  plan?: string
  period?: Period
  addon?: string
  url?: string
  sku?: string
  value?: number
  days?: number
  grace_hours?: number
}
export interface Trial {
  id: number
  sku: string
  value: string
  status: string
  started_at: string
  ends_at: string
  grace_hours: number
}
export interface OfferContent {
  title: string
  body: string
  cta_label: string
  action: OfferAction
  tone?: 'brand' | 'positive' | 'warning' | 'neutral'
  badge?: string
  subject?: string
}
export interface Offer {
  id: number
  surfaces: OfferSurface[]
  content: OfferContent
  ends_at?: string | null
  preview?: boolean
}
export interface UpgradeRequest {
  id: number
  organization_id: string
  email: string
  sku: string
  plan_code: string
  message: string
  status: 'open' | 'done' | 'declined'
  created_at: string
}
export interface Offers {
  user: { email: string; role: string; access: 'member' | 'billing' | 'demo' }
  offers: Offer[]
  upgrade_requests: UpgradeRequest[]
}
export interface EmailCategory {
  category: string
  name: string
  description: string
  locked: boolean
  enabled: boolean
}
export interface EmailPreferences {
  email: string
  categories: EmailCategory[]
}

// ---- plan picker and plan change (pricing-api's customer API)
export interface Quote {
  direction: 'upgrade' | 'downgrade' | 'migrate' | 'same'
  from: string
  to: string
  period: Period
  currency: string
  effective_at: 'now' | 'term_end' | string
  plan_amount: number
  total: number
  projected_overage: number
  kept_addons: { code: string; name: string; quantity: number; amount: number }[]
  auto_addons: { code: string; name: string; quantity: number; amount: number }[]
  conflicts: { sku: string; name: string; used: number; limit: Value; fix: string }[]
  can_apply: boolean
  message: string
}
export interface PlanOption {
  plan: { code: string; name: string; description: string; rank: number; public: boolean; legacy: boolean }
  version: number
  current: boolean
  highlights: { sku: string; value: Value; mode: string; overage_unit_price: number }[]
  quote?: Quote
}
/** Whether a confirm would go through; when not, the error code it would get and why. */
export interface Availability {
  available: boolean
  code?: string
  detail?: string
}
/** A change waiting for the renewal (a downgrade, yearly to monthly). */
export interface ScheduledChange {
  plan: string
  name: string
  effective_on: string
}
export interface PlanOptions {
  segment: string
  self_serve: boolean
  currency: string
  period: Period
  results: PlanOption[]
  // From pricing-api's customer API (absent from core's older relay).
  change?: Availability
  scheduled_change?: ScheduledChange | null
  term_end?: string
  billing_channel?: BillingChannel
  /** Card accounts: whether a usable payment method is on file (null: not a card account, or unknown). */
  payment_method_on_file?: boolean | null
}
/** What a plan change does to the invoices (estimates: Chargebee computes the exact amounts). */
export interface PlanChangeBill {
  currency: string
  effective_on: string
  charge_today: number
  credit_today: number
  due_today: number
  credit_left: number
  next_invoice_on: string
  next_invoice: number
  estimated: boolean
}
export interface PlanChangeResult {
  applied: boolean
  preview?: boolean
  contract_managed?: boolean
  quote: Quote
  bill?: PlanChangeBill
  discount?: { label: string; percent: number; amount: number } | null
  change?: Availability
  duplicate?: boolean
  scheduled_change?: ScheduledChange | null
  cancelled_scheduled_change?: boolean
}

// ---- cancellation (GET|POST|DELETE /organization/{id}/cancellation)
export type CancelReason = 'too_expensive' | 'missing_feature' | 'moving_away' | 'project_ended' | 'not_using' | 'other'
export interface CancellationRecord {
  id: number
  status: 'scheduled' | 'requested' | 'undone' | 'withdrawn' | 'closed' | 'reactivated'
  reason: CancelReason
  feedback: string
  ends_on: string
  requested_by: string
  requested_at: string
  updated_at: string
  handled_at: string | null
}
export interface Cancellation {
  /** What to type to confirm. */
  organization_name: string
  /** cancel: ends at the term end. request: staff confirm it (a contract, a notice period). unavailable: see `unavailable`. */
  mode: 'cancel' | 'request' | 'unavailable'
  unavailable: Availability | null
  billing_channel: BillingChannel
  term_end: string
  ends_on: string
  notice_days: number
  notice_deadline: string | null
  support_days: number
  support_until: string
  after_end: string[]
  reasons: { code: CancelReason; label: string }[]
  current: CancellationRecord | null
}
export interface CancellationResult {
  status: 'scheduled' | 'requested' | 'undone' | 'withdrawn' | 'none'
  existing?: boolean
  cancellation: CancellationRecord | null
}

// ---- usage over a period (GET /organization/{id}/usageHistory)
export type Granularity = 'day' | 'month'
export interface UsageHistoryPoint {
  period: string
  quantity: number
  by_organization: Record<string, number>
  no_data?: boolean
}
export interface UsageHistorySeries {
  sku: string
  name: string
  unit: string
  kind: 'limit' | 'meter'
  source: 'deployments' | 'billed' | 'snapshot'
  /** sum: meters add up over a period. peak: counts show the busiest day. */
  aggregate: 'sum' | 'peak'
  included?: number
  total: number
  points: UsageHistoryPoint[]
}
export interface UsageHistoryAmounts {
  source: 'invoices'
  currency: string
  months: { month: string; invoiced: number; invoices: number }[]
  total: number
  unavailable?: 'aws_marketplace' | 'not_linked' | 'billing_unavailable'
}
/** One usage history answer. Named apart from the <UsageHistory> component the kit also exports. */
export interface UsageHistoryData {
  organization_id: string
  access: 'member' | 'billing' | 'demo'
  from: string
  to: string
  granularity: Granularity
  periods: string[]
  data_since: string | null
  organizations: { id: string; name: string }[]
  series: UsageHistorySeries[]
  amounts?: UsageHistoryAmounts
  notes: string[]
}

// ---- the customer's own billing (GET /organization/{id}/invoices, /paymentMethods, /billingInfo, /awsMarketplace)
export type InvoiceStatus = 'paid' | 'posted' | 'payment_due' | 'not_paid' | 'voided' | 'pending'
export interface CustomerInvoice {
  id: string
  status: InvoiceStatus
  date: string
  due_date: string | null
  paid_at: string | null
  currency: string
  total: number
  amount_due: number
  amount_paid: number
  collectable: boolean
  lines: { description: string; amount: number }[]
}
export type BillingChannel = 'chargebee' | 'aws_marketplace' | 'invoice' | 'unknown'
/** One page of invoices, newest first. next_offset is opaque: pass it back for the next page ("" on the last). */
export interface InvoicePage {
  invoices: CustomerInvoice[]
  next_offset: string
  billing_channel: BillingChannel
  actions_available: boolean
}
export interface InvoiceDownload {
  download_url: string
  valid_till: string
}
export interface PaymentMethod {
  type: string
  brand?: string
  last4?: string
  expiry_month?: number
  expiry_year?: number
  primary: boolean
  status: 'valid' | 'expiring' | 'expired' | 'invalid' | 'pending_verification' | string
}
export interface PaymentMethods {
  payment_methods: PaymentMethod[]
  billing_channel: BillingChannel
  actions_available: boolean
}
export interface PaymentSession {
  url: string
  expires_at: string
}
export interface BillingInfo {
  company: string
  first_name: string
  last_name: string
  email: string
  line1: string
  line2: string
  city: string
  zip: string
  state: string
  country: string
  vat_number: string
}
export interface BillingInfoView extends BillingInfo {
  contacts: { email: string; name: string }[]
  actions_available: boolean
}
export interface AwsMarketplace {
  billing_channel: BillingChannel
  request: {
    id: string
    status: 'open' | 'offer_sent' | 'accepted' | 'closed'
    aws_account_id: string
    message: string
    requested_at: string
    requested_by: string
  } | null
  offer: { url: string; expires_at: string | null; note: string } | null
}

// ---- prepaid credits (GET|POST /organization/{id}/credits, billing roles)
/** A meter the console sells ahead: unit_price is the pay-as-you-go price; annual, a year upfront for less. */
export interface CreditOption {
  sku: string
  name: string
  unit: string
  unit_price: number
  allowance: number
  min: number
  max: number
  step: number
  packs: number[]
  annual?: { min: number; unit_price: number; discount_pct: number }
}
export interface CreditBalance {
  sku: string
  name: string
  unit: string
  bought: number
  balance: number
  drawing: number
  remaining: number
  expires_on: string | null
}
export interface CreditPurchase {
  id: number
  date: string
  sku: string
  name: string
  unit: string
  quantity: number
  unit_price: number
  amount: number
  currency: string
  /** The person's email, "Auto-reload" or "Qovery". */
  by: string
  source: 'console' | 'auto_reload' | 'qovery'
  invoice_id: string
}
export interface Credits {
  organization_id: string
  currency: string
  /** Whether a purchase would go through; when not, the code it would get and why. */
  buy: Availability
  payment_method_on_file: boolean | null
  options: CreditOption[]
  balances: CreditBalance[]
  purchases: CreditPurchase[]
  auto_reload: { sku: string; name: string; enabled: boolean; below_units: number; reload_units: number }[]
}
export interface CreditQuote {
  sku: string
  name: string
  unit: string
  quantity: number
  annual: boolean
  currency: string
  unit_price: number
  amount: number
  payg_amount: number
  saving: number
  balance_after: number
  expires_on: string | null
  tax_note: string
}
export interface CreditPurchaseResult {
  applied: boolean
  preview?: boolean
  duplicate?: boolean
  quote?: CreditQuote
  buy?: Availability
  purchase?: CreditPurchase
  credits?: Credits
}

// ---- reactivation once the subscription ended (GET|POST /organization/{id}/reactivation, billing roles)
export interface ReactivationRecord {
  id: number
  status: 'requested' | 'reactivated' | 'closed'
  plan: string
  period: Period
  requested_by: string
  requested_at: string
  handled_at: string | null
}
export interface Reactivation {
  ended: boolean
  ended_on: string | null
  /** reactivate: a new term starts today. request: staff start it. unavailable: see `unavailable`. */
  mode: 'reactivate' | 'request' | 'unavailable'
  unavailable: Availability | null
  currency: string
  period: Period
  last_plan: { code: string; name: string } | null
  default_plan: string
  plans: { code: string; name: string; description: string; rank: number; prices: Price[] }[]
  payment_method_on_file: boolean | null
  current: ReactivationRecord | null
}
export interface ReactivationQuote {
  plan: string
  name: string
  period: Period
  currency: string
  charge_today: number
  starts_on: string
  next_renewal_on: string
  next_invoice: number
  estimated: boolean
  tax_note: string
}
export interface ReactivationResult {
  applied?: boolean
  preview?: boolean
  duplicate?: boolean
  existing?: boolean
  status?: 'reactivated' | 'requested'
  quote?: ReactivationQuote
  mode?: Reactivation['mode']
  unavailable?: Availability | null
  reactivation?: ReactivationRecord
  subscription?: { plan: string; period: Period; term_end: string }
}
