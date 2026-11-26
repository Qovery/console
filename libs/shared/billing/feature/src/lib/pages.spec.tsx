import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type {
  AwsMarketplace,
  BillingInfoView,
  BillingUsage,
  CustomerInvoice,
  InvoicePage,
  PaymentMethods,
} from 'qovery-pricing-typescript-axios'
import { BillingError, type PricingClient, billing } from '@qovery/shared/billing/data-access'
import { act, renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BillingSettingsPage } from './billing-settings-page'
import { InvoicesPage } from './invoices-page'

const invoice = (over: Partial<CustomerInvoice>): CustomerInvoice => ({
  id: 'INV-1',
  status: 'paid',
  date: '2026-10-01T00:00:00Z',
  due_date: null,
  paid_at: '2026-10-02T00:00:00Z',
  currency: 'USD',
  total: 89900,
  amount_due: 0,
  amount_paid: 89900,
  collectable: false,
  lines: [{ description: 'Growth plan', amount: 89900 }],
  ...over,
})

const invoicePage: InvoicePage = {
  invoices: [
    invoice({ id: 'INV-2', status: 'payment_due', amount_due: 12000, amount_paid: 0, total: 12000, collectable: true }),
    invoice({ id: 'INV-1' }),
  ],
  next_offset: '',
  billing_channel: 'chargebee',
  actions_available: true,
}

const paymentMethods: PaymentMethods = {
  payment_methods: [
    { type: 'card', brand: 'visa', last4: '4242', expiry_month: 12, expiry_year: 2030, primary: true, status: 'valid' },
  ],
  billing_channel: 'chargebee',
  actions_available: true,
}

const billingInfo: BillingInfoView = {
  company: 'Northwind',
  first_name: 'Ada',
  last_name: 'Lovelace',
  email: 'billing@northwind.example',
  line1: '1 Main Street',
  line2: '',
  city: 'Paris',
  zip: '75001',
  state: '',
  country: 'FR',
  vat_number: '',
  contacts: [],
  actions_available: true,
}

const aws: AwsMarketplace = { billing_channel: 'chargebee', request: null, offer: null }

const client = (over: Partial<PricingClient> = {}): PricingClient => ({
  mode: 'live',
  publicPlans: jest.fn(),
  billingUsage: jest.fn().mockReturnValue(new Promise(() => undefined)),
  spendLimits: jest.fn().mockReturnValue(new Promise(() => undefined)),
  invoices: jest.fn().mockResolvedValue(invoicePage),
  paymentMethods: jest.fn().mockResolvedValue(paymentMethods),
  billingInfo: jest.fn().mockResolvedValue(billingInfo),
  awsMarketplace: jest.fn().mockResolvedValue(aws),
  ...over,
})

describe('InvoicesPage', () => {
  it('should list the invoices for a billing admin', async () => {
    renderWithProviders(<InvoicesPage organizationId="org-1" client={client()} access="billing" alerts={false} />)

    expect(await screen.findByText('INV-2')).toBeInTheDocument()
    expect(screen.getByText('INV-1')).toBeInTheDocument()
  })

  it('should pass the next offset and avoid duplicate invoices across pages', async () => {
    const invoices = jest
      .fn()
      .mockResolvedValueOnce({ ...invoicePage, next_offset: 'next' })
      .mockResolvedValueOnce({ ...invoicePage, invoices: [invoice({ id: 'INV-1' }), invoice({ id: 'INV-3' })] })
    const { userEvent } = renderWithProviders(
      <InvoicesPage organizationId="org-1" client={client({ invoices })} access="billing" alerts={false} />
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Load more' }))

    expect(await screen.findByText('INV-3')).toBeInTheDocument()
    expect(screen.getAllByText('INV-1')).toHaveLength(1)
    expect(invoices).toHaveBeenLastCalledWith('org-1', { offset: 'next' })
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument()
  })

  it('keeps invoices on a transient access refresh failure and hides them after access is denied', async () => {
    const queryClient = new QueryClient()
    const usageResponse: BillingUsage = {
      organization_id: 'org-1',
      generated_at: '2026-11-01',
      access: 'billing',
      plan: { code: 'growth', name: 'Growth', version: 1, legacy: false },
      billing: {
        currency: 'USD',
        period: 'year',
        cadence: 'annual',
        term_start: '2026-03-30',
        term_end: '2027-03-30',
        status: 'active',
        locked: false,
      },
      entitlements: [],
      organization_usage: {},
      deployments: {
        from: '2026-10-01',
        to: '2026-10-31',
        deployments: 0,
        build_minutes: 0,
        deploy_minutes: 0,
        days: [],
      },
      prepaid_credits: [],
      status: { status: 'ok' },
      notes: [],
    }
    const pricingClient = client({ billingUsage: jest.fn().mockResolvedValue(usageResponse) })
    const usage = jest.mocked(pricingClient.billingUsage)
    const { queryKey } = billing.usage({ client: pricingClient, organizationId: 'org-1' })
    const { userEvent } = renderWithProviders(
      <QueryClientProvider client={queryClient}>
        <InvoicesPage organizationId="org-1" client={pricingClient} alerts={false} />
      </QueryClientProvider>
    )
    expect(await screen.findByText('INV-1')).toBeInTheDocument()

    usage.mockRejectedValueOnce(new Error('Temporary network failure'))
    await act(() => queryClient.invalidateQueries({ queryKey }))
    expect(await screen.findByText('Billing access could not be refreshed')).toBeInTheDocument()
    expect(screen.getByText('INV-1')).toBeInTheDocument()

    usage.mockRejectedValueOnce(new BillingError(403, 'NOT_AN_ORGANIZATION_MEMBER', 'No access'))
    await act(() => queryClient.invalidateQueries({ queryKey }))
    expect(await screen.findByText(/only owners, admins and billing managers/i)).toBeInTheDocument()
    expect(screen.queryByText('INV-1')).not.toBeInTheDocument()

    usage.mockRejectedValueOnce(new Error('Network failure after access changed'))
    await act(() => queryClient.invalidateQueries({ queryKey }))
    expect(await screen.findByText('Network failure after access changed')).toBeInTheDocument()
    expect(screen.queryByText('INV-1')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByText('INV-1')).toBeInTheDocument()
  })

  it('should not request invoices for a member', async () => {
    const memberClient = client()
    renderWithProviders(<InvoicesPage organizationId="org-1" client={memberClient} access="member" alerts={false} />)

    expect(await screen.findByText(/only owners, admins and billing managers/i)).toBeInTheDocument()
    expect(memberClient.invoices).not.toHaveBeenCalled()
  })

  it('should say an internal organization is never billed', async () => {
    const internal = client({
      invoices: jest.fn().mockRejectedValue(new BillingError(409, 'INTERNAL_ACCOUNT', 'internal')),
    })
    renderWithProviders(<InvoicesPage organizationId="org-1" client={internal} access="billing" alerts={false} />)

    expect(await screen.findByText(/nothing is billed/i)).toBeInTheDocument()
  })
})

describe('BillingSettingsPage', () => {
  it('should show the card and the billing information', async () => {
    renderWithProviders(
      <BillingSettingsPage organizationId="org-1" client={client()} access="billing" alerts={false} />
    )

    expect(await screen.findByText(/Visa ending in 4242/)).toBeInTheDocument()
    expect(await screen.findByDisplayValue('Northwind')).toBeInTheDocument()
  })

  it('should say an internal organization has nothing to manage', async () => {
    const internal = client({
      awsMarketplace: jest.fn().mockResolvedValue({ ...aws, billing_channel: 'internal' }),
    })
    renderWithProviders(
      <BillingSettingsPage organizationId="org-1" client={internal} access="billing" alerts={false} />
    )

    expect(await screen.findByText(/nothing is billed/i)).toBeInTheDocument()
  })
})
