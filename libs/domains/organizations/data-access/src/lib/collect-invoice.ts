import axios from 'axios'
import { type Invoice } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'

// q-core refuses a new attempt on the same invoice for this long.
export const COLLECT_INVOICE_COOLDOWN_SECONDS = 10 * 60

/**
 * Charges the card on file again for an unpaid invoice.
 *
 * TODO: switch to BillingApi from qovery-typescript-axios once the OpenAPI spec has this endpoint.
 * Until then it goes through the default axios instance, the one the generated clients use, so the console
 * auth interceptor adds the API base URL and the bearer token.
 */
export async function collectInvoice({ organizationId, invoiceId }: { organizationId: string; invoiceId: string }) {
  const response = await axios.post<Invoice>(
    `/organization/${encodeURIComponent(organizationId)}/invoice/${encodeURIComponent(invoiceId)}/collect`
  )
  return response.data
}

export type CollectInvoiceError =
  | { type: 'PAYMENT_FAILED'; reason?: string }
  | { type: 'INVOICE_NOT_COLLECTABLE'; reason?: string }
  | { type: 'COLLECT_TOO_SOON'; retryAfterSeconds: number }
  | { type: 'NOT_FOUND' }
  | { type: 'FORBIDDEN' }
  | { type: 'UNKNOWN'; reason?: string }

interface CollectInvoiceErrorLike {
  message?: string
  response?: {
    status?: number
    data?: { detail?: string; error_code?: string }
    // Axios lowercases header names
    headers?: Record<string, unknown>
  }
}

const readRetryAfterSeconds = (headers?: Record<string, unknown>) => {
  const seconds = Number(headers?.['retry-after'])
  // The header is only readable when the API exposes it through CORS: fall back to the documented cooldown.
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : COLLECT_INVOICE_COOLDOWN_SECONDS
}

/** Maps the error rejected by the console auth interceptor to the cases the UI handles. */
export function parseCollectInvoiceError(error: unknown): CollectInvoiceError {
  const { message, response } = (error ?? {}) as CollectInvoiceErrorLike
  const reason = response?.data?.detail ?? message

  return match(response?.status)
    .with(402, () => ({ type: 'PAYMENT_FAILED' as const, reason }))
    .with(409, () => ({ type: 'INVOICE_NOT_COLLECTABLE' as const, reason }))
    .with(429, () => ({
      type: 'COLLECT_TOO_SOON' as const,
      retryAfterSeconds: readRetryAfterSeconds(response?.headers),
    }))
    .with(404, () => ({ type: 'NOT_FOUND' as const }))
    .with(403, () => ({ type: 'FORBIDDEN' as const }))
    .otherwise(() => ({ type: 'UNKNOWN' as const, reason }))
}
