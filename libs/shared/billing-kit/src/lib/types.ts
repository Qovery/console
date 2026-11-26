/*
 * The shape of pricing-api's GET /organization/{id}/billingUsage (docs/INTEGRATION.md). Amounts are
 * cents of `currency`, and only reach billing roles.
 */
export type Value = number | boolean | 'unlimited'
export type Period = 'month' | 'year'
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

/** A builder size and how its build minutes count against the plan. saving: % less than its resources (big builders). */
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
