/*
 * The shapes the billing kit reads. They mirror pricing-api's responses (docs/INTEGRATION.md):
 * GET /public/v1/plans, GET /organization/{id}/billingUsage, GET /organization/{id}/spendLimits,
 * and the plan picker and plan change core relays. Amounts are cents of `currency`.
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

// ---- plan picker and plan change (relayed by core)
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
export interface PlanOptions {
  segment: string
  self_serve: boolean
  currency: string
  period: Period
  results: PlanOption[]
}
export interface PlanChangeResult {
  applied: boolean
  preview?: boolean
  contract_managed?: boolean
  quote: Quote
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
