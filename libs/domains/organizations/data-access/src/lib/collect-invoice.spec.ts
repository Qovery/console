import axios from 'axios'
import { COLLECT_INVOICE_COOLDOWN_SECONDS, collectInvoice, parseCollectInvoiceError } from './collect-invoice'

describe('collectInvoice', () => {
  it('posts to the collect endpoint through the shared axios instance', async () => {
    const invoice = { id: 'inv-1', status: 'PAID' }
    const postSpy = jest.spyOn(axios, 'post').mockResolvedValue({ data: invoice })

    await expect(collectInvoice({ organizationId: 'org-1', invoiceId: 'inv-1' })).resolves.toEqual(invoice)
    expect(postSpy).toHaveBeenCalledWith('/organization/org-1/invoice/inv-1/collect')
  })

  it('encodes path segments', async () => {
    const postSpy = jest.spyOn(axios, 'post').mockResolvedValue({ data: {} })

    await collectInvoice({ organizationId: 'org/1', invoiceId: '../x' })

    expect(postSpy).toHaveBeenCalledWith('/organization/org%2F1/invoice/..%2Fx/collect')
  })
})

describe('parseCollectInvoiceError', () => {
  const serialized = (status: number, data: object = {}, headers: Record<string, unknown> = {}) => ({
    message: 'detail' in data ? (data as { detail: string }).detail : undefined,
    code: String(status),
    response: { status, data, headers },
  })

  it('returns the payment failure reason on 402', () => {
    expect(
      parseCollectInvoiceError(serialized(402, { detail: 'Your card was declined.', error_code: 'PAYMENT_FAILED' }))
    ).toEqual({ type: 'PAYMENT_FAILED', reason: 'Your card was declined.' })
  })

  it('maps 409 to a non collectable invoice', () => {
    expect(parseCollectInvoiceError(serialized(409, { detail: 'This invoice is PAID.' }))).toEqual({
      type: 'INVOICE_NOT_COLLECTABLE',
      reason: 'This invoice is PAID.',
    })
  })

  it('reads Retry-After on 429', () => {
    expect(parseCollectInvoiceError(serialized(429, {}, { 'retry-after': '412' }))).toEqual({
      type: 'COLLECT_TOO_SOON',
      retryAfterSeconds: 412,
    })
  })

  it('falls back to the cooldown when Retry-After is not readable', () => {
    expect(parseCollectInvoiceError(serialized(429))).toEqual({
      type: 'COLLECT_TOO_SOON',
      retryAfterSeconds: COLLECT_INVOICE_COOLDOWN_SECONDS,
    })
  })

  it('maps 404 and 403', () => {
    expect(parseCollectInvoiceError(serialized(404))).toEqual({ type: 'NOT_FOUND' })
    expect(parseCollectInvoiceError(serialized(403))).toEqual({ type: 'FORBIDDEN' })
  })

  it('returns unknown for anything else', () => {
    expect(parseCollectInvoiceError(new Error('Network Error'))).toEqual({ type: 'UNKNOWN', reason: 'Network Error' })
    expect(parseCollectInvoiceError(undefined)).toEqual({ type: 'UNKNOWN', reason: undefined })
  })
})
