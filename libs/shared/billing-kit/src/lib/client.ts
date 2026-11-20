/*
 * Reads an organization's plan and usage from pricing-api with the signed-in user's Qovery token.
 */
import { type BillingUsage } from './types'

export interface PricingClient {
  billingUsage(organizationId: string): Promise<BillingUsage>
}

export class BillingError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
  }
}

export interface ClientOptions {
  /** pricing-api, e.g. https://billing-api.qovery.com */
  pricingApiUrl: string
  /** The signed-in user's Qovery access token (the console already holds it). */
  getToken: () => Promise<string> | string
  fetch?: typeof fetch
}

export function createPricingClient(o: ClientOptions): PricingClient {
  const f = o.fetch ?? fetch.bind(globalThis)
  return {
    async billingUsage(organizationId) {
      const res = await f(`${o.pricingApiUrl.replace(/\/$/, '')}/organization/${organizationId}/billingUsage`, {
        headers: { Authorization: `Bearer ${await o.getToken()}` },
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) throw new BillingError(res.status, body?.code ?? 'ERROR', body?.detail ?? res.statusText)
      return body as BillingUsage
    },
  }
}
