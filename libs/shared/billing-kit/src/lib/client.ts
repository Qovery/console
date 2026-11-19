/*
 * Calls pricing-api for an organization (plan and usage, AWS Marketplace) with the signed-in user's Qovery token.
 */
import { type AwsMarketplace, type AwsMarketplaceOfferRequestInput } from './aws-marketplace'
import { type BillingUsage } from './types'

export interface PricingClient {
  billingUsage(organizationId: string): Promise<BillingUsage>
  awsMarketplace(organizationId: string): Promise<AwsMarketplace>
  requestAwsMarketplaceOffer(organizationId: string, input: AwsMarketplaceOfferRequestInput): Promise<AwsMarketplace>
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
  const baseUrl = o.pricingApiUrl.replace(/\/$/, '')
  const organizationPath = (organizationId: string) => `${baseUrl}/organization/${encodeURIComponent(organizationId)}`

  async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
    const res = await f(url, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${await o.getToken()}` },
    })
    const body = await res.json().catch(() => null)
    if (!res.ok) throw new BillingError(res.status, body?.code ?? 'ERROR', body?.detail ?? res.statusText)
    return body as T
  }

  return {
    billingUsage(organizationId) {
      return request<BillingUsage>(`${organizationPath(organizationId)}/billingUsage`)
    },
    awsMarketplace(organizationId) {
      return request<AwsMarketplace>(`${organizationPath(organizationId)}/awsMarketplace`)
    },
    requestAwsMarketplaceOffer(organizationId, input) {
      return request<AwsMarketplace>(`${organizationPath(organizationId)}/awsMarketplace/offerRequest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
    },
  }
}
