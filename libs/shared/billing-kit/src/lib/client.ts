/*
 * Reads an organization's plan and usage from pricing-api with the signed-in user's Qovery token.
 */
import { z } from 'zod'
import { BillingError, billingData, createBillingApi } from './pricing-transport'
import { type BillingUsage } from './types'

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
  billingUsage(organizationId: string): Promise<BillingUsage>
}

export { BillingError } from './pricing-transport'

export interface ClientOptions {
  /** pricing-api, e.g. https://billing-api.qovery.com */
  pricingApiUrl: string
  /** The signed-in user's Qovery access token (the console already holds it). */
  getToken: () => Promise<string> | string
  fetch?: typeof fetch
}

export function createPricingClient(options: ClientOptions): PricingClient {
  const api = createBillingApi(options)
  return {
    async billingUsage(organizationId) {
      const data = await billingData<BillingUsage>(api.billingUsage({ organizationId }))
      if (!billingUsageSchema.safeParse(data).success) {
        throw new BillingError(502, 'INVALID_RESPONSE', 'Invalid billing usage response')
      }
      return data
    },
  }
}
