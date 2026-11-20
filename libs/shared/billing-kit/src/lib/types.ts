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
    /** How the account pays, and whether it is one of Qovery's own organizations (never billed: amounts are $0). Absent from older servers. */
    billing_channel?: BillingChannel
    internal?: boolean
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

// ---- build usage (GET /organization/{id}/buildUsage; staff: /admin/v1/{organizations|accounts}/{id}/builds)
/** A builder size, "<largest>+" beyond the largest, "none" (no builder provisioned) or "unknown" (not attributed to a service). */
export interface BuildSizeUsage {
  size: string
  name: string
  multiplier: number
  unknown?: boolean
  no_builder?: boolean
  builds: number
  build_minutes: number
  counted_build_minutes: number
  cost?: number
  share: number
}
export interface BuildPeriod {
  period: string
  builds: number
  failed_builds: number
  build_minutes: number
  counted_build_minutes: number
  deploy_minutes: number
  cost?: number
  by_size: Record<string, number>
}
export interface BuildServiceUsage {
  /** Empty: time not attributed to a service. */
  service_id: string
  organization_id: string
  name: string
  type: string
  builds: number
  failed_builds: number
  deployments: number
  build_minutes: number
  counted_build_minutes: number
  deploy_minutes: number
  avg_build_seconds: number
  p95_build_seconds: number
  sizes: string[]
  cost?: number
  build_cost?: number
  share: number
  trend: number[]
  failed_counted_minutes: number
  last_build_at?: string
}
export type BuildHintKind = 'top_cost' | 'downsize' | 'frequent' | 'failed'
export interface BuildHint {
  kind: BuildHintKind
  service_id: string
  service_name: string
  title: string
  detail: string
  minutes: number
  cost?: number
}
export interface BuildRow {
  finished_at: string
  execution_id: string
  environment_id: string
  status: string
  failed: boolean
  build_seconds: number
  deploy_seconds: number
  size: string
  size_name: string
  multiplier: number
  unknown?: boolean
  cpu_milli: number | null
  ram_gib: number | null
  counted_build_minutes: number
  cost?: number
}
export interface BuildTotals {
  builds: number
  failed_builds: number
  deployments: number
  build_minutes: number
  counted_build_minutes: number
  deploy_minutes: number
  build_cost?: number
  deploy_cost?: number
  services: number
  services_built: number
  services_not_built: number
  unknown_builder_builds: number
  no_builder_builds: number
  failed_counted_minutes: number
  failed_cost?: number
  unattributed_deployments: number
}
/** One build usage answer. Costs and prices only for billing roles (and staff). */
export interface BuildUsageData {
  scope?: 'organization' | 'account'
  id?: string
  organization_id?: string
  access?: 'member' | 'billing' | 'demo'
  currency: string
  prices?: { build_per_minute: number; deploy_per_minute: number }
  builder_sizes: BuilderSize[]
  source: { facts_since: string | null; complete: boolean; note: string }
  organizations?: Record<string, string>
  from: string
  to: string
  granularity: Granularity
  totals: BuildTotals
  by_size: BuildSizeUsage[]
  periods: BuildPeriod[]
  services: BuildServiceUsage[]
  hints: BuildHint[]
  /** One service's builds, newest first, when asked for with `service`. */
  builds?: BuildRow[]
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
export type BillingChannel = 'chargebee' | 'aws_marketplace' | 'invoice' | 'internal' | 'unknown'
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
/** One invoice in detail (GET /organization/{id}/invoices/{invoiceId}). Amounts in cents. */
export interface InvoiceDetails {
  id: string
  status: InvoiceStatus
  date: string
  due_date: string | null
  paid_at: string | null
  currency: string
  period_from: string | null
  period_to: string | null
  subtotal: number
  discounts: number
  discount_lines: { description: string; amount: number }[]
  tax: number
  total: number
  amount_paid: number
  amount_due: number
  collectable: boolean
  lines: InvoiceDetailLine[]
  billing_channel: BillingChannel
  actions_available: boolean
  notes: string[]
}
export type InvoiceLineKind = 'plan' | 'addon' | 'usage' | 'charge'
export interface InvoiceDetailLine {
  kind: InvoiceLineKind
  label: string
  description: string
  sku?: string
  /** In unit (usage lines: the SKU's unit). */
  quantity: number
  unit?: string
  /** Cents per unit, when the line has one price per unit. */
  unit_price?: number
  amount: number
  discount: number
  net: number
  from: string | null
  to: string | null
  usage?: InvoiceLineUsage
}
/** complete: every day of the period is recorded; partial: the record starts during it (since); none. */
export type UsageCoverage = 'complete' | 'partial' | 'none'
export interface InvoiceLineUsage {
  sku: string
  name: string
  unit: string
  /** First and last day of the period (inclusive). */
  from: string
  to: string
  available: UsageCoverage
  since: string | null
  /** billed: what the billing pipeline recorded; deployment_reports: the deployment minutes core reported. */
  source: 'billed' | 'deployment_reports'
  /** sum: the days add up (a meter); per_day: the count in use each day. */
  aggregate: 'sum' | 'per_day'
  total: number
  billed: number
  /** The period's usage the line does not bill (included in the plan or prepaid). */
  not_billed?: number
  days: { day: string; quantity: number; organizations?: Record<string, number> }[]
  organizations: { organization_id: string; name: string; quantity: number }[]
  builds?: InvoiceLineBuilds
  notes: string[]
}
export interface InvoiceLineBuilds {
  available: UsageCoverage
  since: string | null
  note: string
  services: {
    organization_id: string
    organization: string
    name: string
    type: string
    builds: number
    failed_builds: number
    deployments: number
    build_minutes: number
    counted_build_minutes: number
    deploy_minutes: number
    sizes: string[]
  }[]
  by_size: { name: string; multiplier: number; builds: number; build_minutes: number; counted_build_minutes: number }[]
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

// ---- self-serve discounts (GET /organization/{id}/discounts, POST .../discounts/quote, .../discountRequests; billing roles)
/** A discount the customer may ask for: percent points, in exchange for what it `gives`. */
export interface DiscountType {
  id: string
  label: string
  percent: number
  gives: string
  /** At least one of these must be chosen (or already granted) with it; requires_label says so. */
  requires: string[]
  requires_label?: string
  /** Cannot be combined with any of these. */
  excludes: string[]
  /** A commitment it brings (24, 36 months), 0 when none. */
  term_months: number
}
export interface DiscountRequest {
  id: number
  status: 'open' | 'approved' | 'declined' | 'withdrawn'
  discount_ids: string[]
  labels: string[]
  percent: number
  message: string
  currency: string
  period: Period
  price_before: number
  price_after: number
  requested_by: string
  requested_at: string
  decided_at: string | null
  decline_reason: string
  discount_until: string | null
  /** Approved and on the subscription (an approval staff still add in Chargebee is not applied yet). */
  applied: boolean
}
export interface Discounts {
  organization_id: string
  availability: Availability
  currency: string
  period: Period
  /** The recurring price per period today (plan and add-ons, after discounts already running). */
  price: number
  annual_price: number
  max_percent: number
  /** What may be asked for now: empty while a request is being reviewed. */
  discounts: DiscountType[]
  granted: string[]
  requests: DiscountRequest[]
}
/** A dry run of a selection: points add up (capped at max_percent) on plan and add-ons. */
export interface DiscountQuote {
  ids: string[]
  points: number
  percent: number
  max_percent: number
  capped: boolean
  currency: string
  period: Period
  price_before: number
  price_after: number
  saving: number
  annual_before: number
  annual_after: number
  discount_until: string
  term_months: number
}

// ---- feature gates, paywalls and feature trials (pricing-api's customer API, 3.4i)
export type GateReason =
  | ''
  | 'not_in_plan'
  | 'limit_reached'
  | 'trial_used'
  | 'payment_required'
  | 'account_locked'
  | 'not_linked'
  | 'unknown_action'
  | 'trial_active'
  | 'not_applicable'
export type PaywallOptionType =
  | 'start_trial'
  | 'upgrade'
  | 'addon'
  | 'request_admin'
  | 'contact_sales'
  | 'update_payment'
export interface PaywallOption {
  type: PaywallOptionType
  label: string
  detail?: string
  recommended?: boolean
  // start_trial
  days?: number
  includes?: string
  end_behaviour?: string
  // upgrade, addon
  plan?: string
  plan_name?: string
  addon?: string
  addon_name?: string
  amount?: number
  difference?: number
  period?: Period
  currency?: string
}
export interface PaywallInfo {
  sku: string
  title: string
  message: string
  headline: string
  benefits: string[]
  media?: { url: string; kind: 'image' | 'video' }
  options: PaywallOption[]
  /** Who the options were ranked for: a billing role (also the check's 402) or a member. */
  audience: 'billing' | 'member'
  /** Why no trial is offered (used, disabled, sales_led…); absent when one is. */
  trial_block?: string
}
export interface Gate {
  action?: string
  sku: string
  name: string
  allowed: boolean
  reason: GateReason
  limit: Value
  used: number
  requested: number
  trial?: { until: string }
  paywall?: PaywallInfo
}
export interface Gates {
  organization_id: string
  access: 'member' | 'billing' | 'demo'
  gates: Gate[]
}
export interface TrialContinue {
  type: 'plan' | 'addon'
  code: string
  name: string
  period: Period
  text?: string
}
export interface CustomerTrial {
  id: number
  sku: string
  name: string
  what: string
  status: 'active' | 'converted' | 'grace' | 'cleanup_due' | 'cleaned' | 'cancelled'
  source: 'offer' | 'paywall'
  started_at: string
  ends_at: string
  grace_until?: string | null
  started_by?: string
  continue?: TrialContinue | null
}
export interface TrialStartRequest {
  sku?: string
  action?: string
  continue?: { plan?: string; addon?: string; period?: Period }
  accept_auto_charge?: boolean
}
export interface TrialStartResult {
  trial: CustomerTrial
  gate: Gate
  preview?: boolean
}
export interface AddonQuote {
  code: string
  name: string
  quantity: number
  unit_amount: number
  amount: number
  period: Period
  currency: string
}
export interface AddonPurchaseResult {
  applied: boolean
  quote?: AddonQuote
  buy?: Availability
  duplicate?: boolean
  preview?: boolean
}
export type PaywallEvent = 'shown' | 'clicked' | 'dismissed'
