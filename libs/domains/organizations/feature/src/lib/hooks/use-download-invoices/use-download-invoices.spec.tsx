import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type Invoice, InvoiceStatusEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { act, renderHook, waitFor } from '@qovery/shared/util-tests'
import { useDownloadInvoices } from './use-download-invoices'

const mockInvoiceUrl = jest.fn()
const mockToast = jest.fn()

jest.mock('@qovery/domains/organizations/data-access', () => ({
  ...jest.requireActual('@qovery/domains/organizations/data-access'),
  mutations: {
    ...jest.requireActual('@qovery/domains/organizations/data-access').mutations,
    invoiceUrl: (...args: unknown[]) => mockInvoiceUrl(...args),
  },
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  toast: (...args: unknown[]) => mockToast(...args),
}))

const invoice = (id: string): Invoice => ({
  id,
  status: InvoiceStatusEnum.PAID,
  currency_code: 'USD',
  created_at: '2026-01-01T00:00:00.000Z',
  total: 100,
  total_in_cents: 10000,
})

const invoices = [invoice('a'), invoice('b'), invoice('c')]

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
)

describe('useDownloadInvoices', () => {
  let clickSpy: jest.SpyInstance

  beforeEach(() => {
    mockInvoiceUrl.mockReset()
    mockToast.mockReset()
    clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
  })

  afterEach(() => {
    clickSpy.mockRestore()
  })

  it('downloads every invoice one by one through the per-invoice endpoint', async () => {
    mockInvoiceUrl.mockImplementation(async ({ invoiceId }: { invoiceId: string }) => ({
      url: `https://invoices.example.com/${invoiceId}.pdf`,
    }))
    const { result } = renderHook(() => useDownloadInvoices({ organizationId: 'org-1', delayMs: 0 }), { wrapper })

    await act(() => result.current.downloadAll(invoices))

    expect(mockInvoiceUrl.mock.calls.map(([args]) => args)).toEqual([
      { organizationId: 'org-1', invoiceId: 'a' },
      { organizationId: 'org-1', invoiceId: 'b' },
      { organizationId: 'org-1', invoiceId: 'c' },
    ])
    expect(clickSpy).toHaveBeenCalledTimes(3)
    expect(mockToast).toHaveBeenCalledWith('success', '3 invoices downloaded')
    expect(result.current.progress).toBeUndefined()
  })

  it('keeps going after a failure and reports the failure count', async () => {
    mockInvoiceUrl
      .mockResolvedValueOnce({ url: 'https://invoices.example.com/a.pdf' })
      .mockRejectedValueOnce(new Error('403'))
      .mockResolvedValueOnce({ url: 'https://invoices.example.com/c.pdf' })
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const { result } = renderHook(() => useDownloadInvoices({ organizationId: 'org-1', delayMs: 0 }), { wrapper })

    await act(() => result.current.downloadAll(invoices))

    expect(mockInvoiceUrl).toHaveBeenCalledTimes(3)
    expect(clickSpy).toHaveBeenCalledTimes(2)
    expect(mockToast).toHaveBeenCalledWith(
      'error',
      '2 of 3 invoices downloaded',
      '1 invoice could not be downloaded. Try them one by one from the list.'
    )
  })

  it('stops when cancelled', async () => {
    let resolveFirst: (value: { url: string }) => void = () => undefined
    mockInvoiceUrl.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve
        })
    )
    const { result } = renderHook(() => useDownloadInvoices({ organizationId: 'org-1', delayMs: 0 }), { wrapper })

    let run: Promise<void> = Promise.resolve()
    act(() => {
      run = result.current.downloadAll(invoices)
    })
    await waitFor(() => expect(result.current.progress).toEqual({ total: 3, completed: 0, failed: 0 }))

    act(() => result.current.cancel())
    await act(async () => {
      resolveFirst({ url: 'https://invoices.example.com/a.pdf' })
      await run
    })

    expect(mockInvoiceUrl).toHaveBeenCalledTimes(1)
    expect(clickSpy).not.toHaveBeenCalled()
    expect(mockToast).toHaveBeenCalledWith('warning', 'Download cancelled', '0 of 3 invoices downloaded.')
    expect(result.current.isDownloading).toBe(false)
  })

  it('does nothing without invoices', async () => {
    const { result } = renderHook(() => useDownloadInvoices({ organizationId: 'org-1', delayMs: 0 }), { wrapper })

    await act(() => result.current.downloadAll([]))

    expect(mockInvoiceUrl).not.toHaveBeenCalled()
    expect(mockToast).not.toHaveBeenCalled()
  })
})
