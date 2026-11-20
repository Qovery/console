import { useFeatureFlagEnabled } from 'posthog-js/react'
import {
  type BillingUsage,
  type CustomerInvoice,
  billingUsageFactoryMock,
  createPricingClient,
} from '@qovery/shared/billing-kit'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { pickConsoleCalls, usePricingClient } from '../hooks/use-pricing-client/use-pricing-client'
import { BillingSettingsView, InvoicesView, SettingsBillingSettings, SettingsInvoices } from './settings-billing-pages'

const mockNavigate = jest.fn()

jest.mock('posthog-js/react', () => ({
  useFeatureFlagEnabled: jest.fn(),
}))
jest.mock('../hooks/use-pricing-client/use-pricing-client', () => ({
  ...jest.requireActual('../hooks/use-pricing-client/use-pricing-client'),
  usePricingClient: jest.fn(),
}))
jest.mock('../settings-billing-summary/settings-billing-summary', () => ({
  SettingsBillingSummary: () => <div>Billing summary page</div>,
}))
jest.mock('../settings-billing-details/settings-billing-details', () => ({
  SettingsBillingDetails: () => <div>Billing details page</div>,
}))
jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useDocumentTitle: jest.fn(),
}))
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-northwind' }),
  useNavigate: () => mockNavigate,
}))

const overdueInvoice: CustomerInvoice = {
  id: 'INV-2026-0042',
  status: 'payment_due',
  date: '2026-11-01T00:00:00Z',
  due_date: '2026-11-01T00:00:00Z',
  paid_at: null,
  currency: 'USD',
  total: 89900,
  amount_due: 89900,
  amount_paid: 0,
  collectable: true,
  lines: [{ description: 'Growth', amount: 89900 }],
}

const jsonResponse = (status: number, body: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText: '',
    headers: new Headers(),
    json: () => Promise.resolve(body),
  }) as Response

const mockPricingApi = (usage: BillingUsage, invoices: CustomerInvoice[] = [overdueInvoice]) => {
  const fetchMock = jest.fn((url: string, init?: RequestInit) => {
    const path = new URL(url).pathname
    if (path.endsWith('/billingUsage')) return Promise.resolve(jsonResponse(200, usage))
    if (path.endsWith('/collect') && init?.method === 'POST') {
      return Promise.resolve(jsonResponse(200, { ...invoices[0], status: 'paid', collectable: false }))
    }
    if (path.endsWith('/invoices')) {
      return Promise.resolve(
        jsonResponse(200, { invoices, next_offset: '', billing_channel: 'chargebee', actions_available: true })
      )
    }
    if (path.endsWith('/paymentMethods')) {
      return Promise.resolve(
        jsonResponse(200, {
          payment_methods: [
            { type: 'card', brand: 'visa', last4: '4242', expiry_month: 12, expiry_year: 2030, primary: true },
          ],
          billing_channel: 'chargebee',
          actions_available: true,
        })
      )
    }
    return Promise.resolve(jsonResponse(404, { code: 'NOT_FOUND', detail: 'not found' }))
  })
  jest.mocked(usePricingClient).mockReturnValue(
    pickConsoleCalls(
      createPricingClient({
        pricingApiUrl: 'https://billing-api.qovery.com',
        getToken: () => 'user-token',
        fetch: fetchMock as unknown as typeof fetch,
      })
    )
  )
  return fetchMock
}

const calledPaths = (fetchMock: jest.Mock) => fetchMock.mock.calls.map(([url]) => new URL(url).pathname)

describe('SettingsInvoices and SettingsBillingSettings', () => {
  it('should show the billing summary and billing details when the flag is off', () => {
    jest.mocked(useFeatureFlagEnabled).mockReturnValue(false)
    const fetchMock = mockPricingApi(billingUsageFactoryMock())

    renderWithProviders(<SettingsInvoices />)
    expect(screen.getByText('Billing summary page')).toBeInTheDocument()

    renderWithProviders(<SettingsBillingSettings />)
    expect(screen.getByText('Billing details page')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('should show the invoices page when the flag is on', async () => {
    jest.mocked(useFeatureFlagEnabled).mockReturnValue(true)
    mockPricingApi(billingUsageFactoryMock())
    renderWithProviders(<SettingsInvoices />)

    expect(await screen.findByText('INV-2026-0042')).toBeInTheDocument()
    expect(screen.queryByText('Billing summary page')).not.toBeInTheDocument()
  })
})

describe('InvoicesView', () => {
  beforeEach(() => mockNavigate.mockClear())

  it('should show members one line without calling the invoice or payment APIs', async () => {
    const fetchMock = mockPricingApi(billingUsageFactoryMock('member'))
    renderWithProviders(<InvoicesView />)

    expect(
      await screen.findByText(
        'Only Owners, Admins and Billing Managers can see invoices and payment details. Ask one of them.'
      )
    ).toBeInTheDocument()
    expect(calledPaths(fetchMock).every((path) => path.endsWith('/billingUsage'))).toBe(true)
  })

  it('should open the billing page to update the payment method', async () => {
    mockPricingApi(billingUsageFactoryMock())
    const { userEvent } = renderWithProviders(<InvoicesView />)

    await screen.findByText('INV-2026-0042')
    await userEvent.click(screen.getByRole('button', { name: 'Update payment method' }))

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/settings/billing-settings',
      params: { organizationId: 'org-northwind' },
    })
  })

  it('should confirm before paying an invoice', async () => {
    const fetchMock = mockPricingApi(billingUsageFactoryMock())
    const { userEvent } = renderWithProviders(<InvoicesView />)

    await screen.findByText('INV-2026-0042')
    await userEvent.click(screen.getByRole('button', { name: 'Pay now' }))
    expect(await screen.findByText('Pay $899.00 now?')).toBeInTheDocument()
    expect(calledPaths(fetchMock).some((path) => path.endsWith('/collect'))).toBe(false)

    await userEvent.click(screen.getByRole('button', { name: 'Pay $899.00' }))
    expect(calledPaths(fetchMock)).toContain('/organization/org-northwind/invoices/INV-2026-0042/collect')
  })
})

describe('BillingSettingsView', () => {
  beforeEach(() => mockNavigate.mockClear())

  it('should link the overdue alert to the invoices page', async () => {
    mockPricingApi(billingUsageFactoryMock())
    const { userEvent } = renderWithProviders(<BillingSettingsView />)

    await userEvent.click(await screen.findByRole('button', { name: 'View invoices' }))

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/settings/invoices',
      params: { organizationId: 'org-northwind' },
    })
  })

  it('should show members one line', async () => {
    mockPricingApi(billingUsageFactoryMock('member'))
    renderWithProviders(<BillingSettingsView />)

    expect(
      await screen.findByText(
        'Only Owners, Admins and Billing Managers can see invoices and payment details. Ask one of them.'
      )
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View invoices' })).not.toBeInTheDocument()
  })
})
