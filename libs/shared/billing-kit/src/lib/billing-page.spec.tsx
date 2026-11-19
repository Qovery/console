import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BillingPage } from './billing-page'
import { billingUsageFactoryMock } from './billing-usage-factory.mock'

describe('BillingPage', () => {
  it('should render the plan, every limit and the features', () => {
    renderWithProviders(<BillingPage usage={billingUsageFactoryMock()} />)

    expect(screen.getByText('Growth')).toBeInTheDocument()
    expect(screen.getAllByText('Managed clusters').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Deployment minutes').length).toBeGreaterThan(0)
    expect(screen.getAllByText('7,657').length).toBeGreaterThan(0)
    expect(screen.getByText('Single sign-on')).toBeInTheDocument()
  })

  it('should not offer any plan change or upgrade', () => {
    renderWithProviders(<BillingPage usage={billingUsageFactoryMock()} />)

    expect(
      screen.queryByRole('button', { name: /change plan|compare plans|upgrade|ask an admin/i })
    ).not.toBeInTheDocument()
  })

  it('should open the usage chart of a limit', async () => {
    const { userEvent } = renderWithProviders(<BillingPage usage={billingUsageFactoryMock()} />)

    await userEvent.click(screen.getAllByRole('button', { name: 'View usage' })[0])

    expect(await screen.findByText(/In use each day, over three months/)).toBeInTheDocument()
  })

  it('should show the payment failed banner', () => {
    const usage = billingUsageFactoryMock()
    usage.status = { status: 'payment_failed', grace_until: '2026-11-15', message: 'Update your card' }
    renderWithProviders(<BillingPage usage={usage} />)

    expect(screen.getByText('Your last payment failed')).toBeInTheDocument()
  })
})
