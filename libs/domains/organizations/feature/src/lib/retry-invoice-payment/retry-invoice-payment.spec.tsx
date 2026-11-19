import axios from 'axios'
import { type Invoice, InvoiceStatusEnum } from 'qovery-typescript-axios'
import { costToHuman } from '@qovery/shared/util-js'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { RetryInvoicePaymentButton } from './retry-invoice-payment-button'
import { useRetryInvoicePayment } from './use-retry-invoice-payment'

const mockNavigate = jest.fn()
const mockToast = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  toast: (...args: unknown[]) => mockToast(...args),
}))

const invoice: Invoice = {
  id: 'inv-1',
  status: InvoiceStatusEnum.PAYMENT_DUE,
  currency_code: 'USD',
  created_at: '2026-10-01T00:00:00.000Z',
  total: 1250,
  total_in_cents: 125000,
}

// Shape the console auth interceptor rejects with
const apiError = (status: number, detail?: string, headers: Record<string, string> = {}) => ({
  message: detail,
  code: String(status),
  response: { status, data: { detail }, headers },
})

function Harness({ invoice }: { invoice: Invoice }) {
  const { requestPayment, pendingInvoiceId, getRetryAllowedAt } = useRetryInvoicePayment({ organizationId: 'org-1' })
  return (
    <RetryInvoicePaymentButton
      invoice={invoice}
      onClick={requestPayment}
      isLoading={pendingInvoiceId === invoice.id}
      retryAllowedAt={getRetryAllowedAt(invoice.id)}
    />
  )
}

const payFromConfirmation = async (userEvent: ReturnType<typeof renderWithProviders>['userEvent']) => {
  await userEvent.click(screen.getByTestId('retry-invoice-payment-btn'))
  await userEvent.click(await screen.findByRole('button', { name: /^Pay / }))
}

describe('RetryInvoicePaymentButton', () => {
  let postSpy: jest.SpyInstance

  beforeEach(() => {
    mockNavigate.mockReset()
    mockToast.mockReset()
    postSpy = jest.spyOn(axios, 'post')
  })

  afterEach(() => {
    postSpy.mockRestore()
  })

  it('says Pay now for an invoice with payment due', () => {
    renderWithProviders(<Harness invoice={invoice} />)
    expect(screen.getByRole('button', { name: 'Pay now' })).toBeEnabled()
  })

  it('says Retry payment for an unpaid invoice', () => {
    renderWithProviders(<Harness invoice={{ ...invoice, status: InvoiceStatusEnum.NOT_PAID }} />)
    expect(screen.getByRole('button', { name: 'Retry payment' })).toBeEnabled()
  })

  it('asks for confirmation with the amount and the card on file', async () => {
    const { userEvent } = renderWithProviders(<Harness invoice={invoice} />)

    await userEvent.click(screen.getByTestId('retry-invoice-payment-btn'))

    expect(await screen.findByText('Pay this invoice now?')).toBeInTheDocument()
    expect(screen.getByText(/to the card on file/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: `Pay ${costToHuman(1250, 'USD')}` })).toBeInTheDocument()
    expect(postSpy).not.toHaveBeenCalled()
  })

  it('does not charge when the user cancels', async () => {
    const { userEvent } = renderWithProviders(<Harness invoice={invoice} />)

    await userEvent.click(screen.getByTestId('retry-invoice-payment-btn'))
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    expect(postSpy).not.toHaveBeenCalled()
  })

  it('is disabled while the payment is pending, then reports success', async () => {
    let resolvePayment: (value: { data: Invoice }) => void = () => undefined
    postSpy.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePayment = resolve
        })
    )
    const { userEvent } = renderWithProviders(<Harness invoice={invoice} />)

    await payFromConfirmation(userEvent)

    expect(postSpy).toHaveBeenCalledWith('/organization/org-1/invoice/inv-1/collect')
    await waitFor(() => expect(screen.getByTestId('retry-invoice-payment-btn')).toBeDisabled())

    resolvePayment({ data: { ...invoice, status: InvoiceStatusEnum.PAID } })

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith('success', 'Payment succeeded', expect.stringContaining('is paid'))
    )
    await waitFor(() => expect(screen.getByTestId('retry-invoice-payment-btn')).toBeEnabled())
  })

  it('shows the 402 reason with a link to update the payment method', async () => {
    postSpy.mockRejectedValue(apiError(402, 'Your card was declined.'))
    const { userEvent } = renderWithProviders(<Harness invoice={invoice} />)

    await payFromConfirmation(userEvent)

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        'error',
        'Payment failed',
        'Your card was declined.',
        expect.any(Function),
        'Update payment method'
      )
    )

    const goToBillingDetails = mockToast.mock.calls[0][3]
    goToBillingDetails()
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/settings/billing-details',
      params: { organizationId: 'org-1' },
    })
  })

  it('explains when the invoice is no longer payable (409)', async () => {
    postSpy.mockRejectedValue(apiError(409, 'This invoice is PAID.'))
    const { userEvent } = renderWithProviders(<Harness invoice={invoice} />)

    await payFromConfirmation(userEvent)

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith('warning', 'This invoice cannot be paid now', expect.any(String))
    )
  })

  it('tells when the user can retry and blocks the button (429)', async () => {
    postSpy.mockRejectedValue(apiError(429, 'Try again later.', { 'retry-after': '412' }))
    const { userEvent } = renderWithProviders(<Harness invoice={invoice} />)

    await payFromConfirmation(userEvent)

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        'warning',
        'A payment was just attempted on this invoice',
        'You can try again in 7 minutes.'
      )
    )
    expect(screen.getByTestId('retry-invoice-payment-btn')).toBeDisabled()
  })
})
