/*
 * pricing-api's AWS Marketplace private offer flow: GET /organization/{id}/awsMarketplace and
 * POST /organization/{id}/awsMarketplace/offerRequest. Billing roles only.
 */
export type BillingChannel = 'chargebee' | 'aws_marketplace' | 'invoice' | 'unknown'
export type AwsMarketplaceRequestStatus = 'open' | 'offer_sent' | 'accepted' | 'closed'

export interface AwsMarketplaceRequest {
  id: string
  status: AwsMarketplaceRequestStatus
  aws_account_id: string
  message: string
  requested_at: string
  requested_by: string
}

export interface AwsMarketplaceOffer {
  url: string
  expires_at: string | null
  note: string
}

export interface AwsMarketplace {
  billing_channel: BillingChannel
  request: AwsMarketplaceRequest | null
  offer: AwsMarketplaceOffer | null
}

export interface AwsMarketplaceOfferRequestInput {
  aws_account_id: string
  message?: string
}

export const AWS_MARKETPLACE_MESSAGE_MAX_LENGTH = 1000
const OFFER_URL_MAX_LENGTH = 2048

/** The 12-digit id of the AWS account that will accept the offer, digits only. */
export function isValidAwsAccountId(value: string) {
  return /^[0-9]{12}$/.test(value)
}

/**
 * Same rule as pricing-api's validOfferURL: https, host aws.amazon.com, console.aws.amazon.com or a
 * subdomain of the latter, no userinfo, no port, "marketplace" in the path. The console only renders
 * the offer link when it passes, so a bad value stored server side cannot send users elsewhere.
 */
export function isTrustedAwsMarketplaceOfferUrl(raw: unknown): raw is string {
  if (typeof raw !== 'string' || raw === '' || raw.length > OFFER_URL_MAX_LENGTH) return false
  // eslint-disable-next-line no-control-regex
  if (/[\\\s\u0000-\u001f\u007f-\u009f]/.test(raw)) return false

  // The raw authority must be the bare host: rejects userinfo, ports (even :443) and opaque forms like https:host
  const authority = /^https:\/\/([^/?#]*)/i.exec(raw)?.[1]
  if (!authority) return false

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return false
  }

  if (url.protocol !== 'https:' || url.username || url.password || url.port) return false
  const host = url.hostname.toLowerCase()
  if (authority.toLowerCase() !== host) return false
  if (host !== 'aws.amazon.com' && host !== 'console.aws.amazon.com' && !host.endsWith('.console.aws.amazon.com')) {
    return false
  }

  return url.pathname.toLowerCase().includes('marketplace')
}
