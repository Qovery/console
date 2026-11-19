import { type Invoice, InvoiceStatusEnum } from 'qovery-typescript-axios'
import * as iamFeature from '@qovery/shared/iam/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useInvoicesImport from '../hooks/use-invoices/use-invoices'
import { InvoiceBanner } from './invoice-banner'

const mockNavigate = jest.fn()
const mockFlags: Record<string, boolean> = {}

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1' }),
  useNavigate: () => mockNavigate,
}))

jest.mock('posthog-js/react', () => ({
  ...jest.requireActual('posthog-js/react'),
  useFeatureFlagEnabled: (flag: string) => mockFlags[flag] ?? false,
}))

const useInvoicesSpy = jest.spyOn(useInvoicesImport, 'useInvoices')
const useCanManageBillingSpy = jest.spyOn(iamFeature, 'useCanManageBilling')

const invoice = (id: string, status: InvoiceStatusEnum): Invoice => ({
  id,
  status,
  currency_code: 'USD',
  created_at: '2026-10-01T00:00:00.000Z',
  total: 100,
  total_in_cents: 10000,
})

const mockInvoices = (invoices: Invoice[]) =>
  useInvoicesSpy.mockReturnValue({ data: invoices } as ReturnType<typeof useInvoicesImport.useInvoices>)

describe('InvoiceBanner', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    mockFlags['billing-retry-payment'] = true
    mockFlags['hide_invoice_banner'] = false
    useCanManageBillingSpy.mockReturnValue({ canManageBilling: true, loading: false })
    mockInvoices([invoice('a', InvoiceStatusEnum.PAYMENT_DUE), invoice('b', InvoiceStatusEnum.PAID)])
  })

  it('shows overdue invoices to billing roles', () => {
    renderWithProviders(<InvoiceBanner />)

    expect(screen.getByText(/You have an overdue invoice\./)).toBeInTheDocument()
    expect(useInvoicesSpy).toHaveBeenCalledWith({ organizationId: 'org-1', enabled: true })
  })

  it('is hidden and does not fetch invoices for members without billing access', () => {
    useCanManageBillingSpy.mockReturnValue({ canManageBilling: false, loading: false })
    renderWithProviders(<InvoiceBanner />)

    expect(screen.queryByText(/overdue/)).not.toBeInTheDocument()
    expect(useInvoicesSpy).toHaveBeenCalledWith({ organizationId: 'org-1', enabled: false })
  })

  it('is hidden while the billing-retry-payment flag is off', () => {
    mockFlags['billing-retry-payment'] = false
    renderWithProviders(<InvoiceBanner />)

    expect(screen.queryByText(/overdue/)).not.toBeInTheDocument()
  })

  it('is hidden when the hide_invoice_banner flag is on', () => {
    mockFlags['hide_invoice_banner'] = true
    renderWithProviders(<InvoiceBanner />)

    expect(screen.queryByText(/overdue/)).not.toBeInTheDocument()
  })

  it('is hidden without unpaid invoices', () => {
    mockInvoices([invoice('b', InvoiceStatusEnum.PAID)])
    renderWithProviders(<InvoiceBanner />)

    expect(screen.queryByText(/overdue/)).not.toBeInTheDocument()
  })

  it('links to the billing details page to update the payment method', async () => {
    const { userEvent } = renderWithProviders(<InvoiceBanner />)

    await userEvent.click(screen.getByRole('button', { name: /Update payment method/ }))

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/settings/billing-details',
      params: { organizationId: 'org-1' },
    })
  })

  it('opens the payment confirmation for a single unpaid invoice', async () => {
    const { userEvent } = renderWithProviders(<InvoiceBanner />)

    await userEvent.click(screen.getByRole('button', { name: 'Retry payment' }))

    expect(await screen.findByText('Pay this invoice now?')).toBeInTheDocument()
  })

  it('sends the user to the invoices list when several invoices are unpaid', async () => {
    mockInvoices([invoice('a', InvoiceStatusEnum.PAYMENT_DUE), invoice('c', InvoiceStatusEnum.NOT_PAID)])
    const { userEvent } = renderWithProviders(<InvoiceBanner />)

    expect(screen.getByText(/You have 2 overdue invoices\./)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Retry payment' }))

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/settings/billing-summary',
      params: { organizationId: 'org-1' },
    })
  })
})
