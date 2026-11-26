import type { PricingClient } from '@qovery/shared/billing/data-access'
import { billingUsageFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BillingPage } from './billing-page'

const client = (): PricingClient => ({
  mode: 'live',
  publicPlans: jest.fn().mockReturnValue(new Promise(() => undefined)),
  billingUsage: jest.fn().mockResolvedValue(billingUsageFactoryMock()),
  spendLimits: jest.fn().mockRejectedValue(new Error('no spend limits')),
})

describe('BillingPage', () => {
  it('links the active tab to its panel and switches tabs', async () => {
    const onTabChange = jest.fn()
    const { userEvent } = renderWithProviders(
      <BillingPage organizationId="org-1" client={client()} offers="none" onTabChange={onTabChange} />
    )

    const usage = screen.getByRole('tab', { name: 'Usage', selected: true })
    expect(screen.getByRole('tabpanel', { name: 'Usage' })).toHaveAttribute('id', usage.getAttribute('aria-controls'))
    await userEvent.click(screen.getByRole('tab', { name: 'Invoices' }))

    expect(screen.getByRole('tabpanel', { name: 'Invoices' })).toBeInTheDocument()
    expect(onTabChange).toHaveBeenCalledWith('invoices')
  })

  it('tracks changes to the controlled tab', () => {
    const pricingClient = client()
    const { rerender } = renderWithProviders(
      <BillingPage organizationId="org-1" client={pricingClient} tab="billing" />
    )

    expect(screen.getByRole('tabpanel', { name: 'Billing' })).toBeInTheDocument()
    rerender(<BillingPage organizationId="org-1" client={pricingClient} tab="invoices" />)

    expect(screen.getByRole('tabpanel', { name: 'Invoices' })).toBeInTheDocument()
  })

  it('opens the initial journey only on the first visit to Usage', async () => {
    const { userEvent } = renderWithProviders(
      <BillingPage organizationId="org-1" client={client()} offers="none" open={{ modal: 'compare' }} />
    )

    expect(await screen.findByRole('heading', { name: 'Compare plans' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    await userEvent.click(screen.getByRole('tab', { name: 'Invoices' }))
    await userEvent.click(screen.getByRole('tab', { name: 'Usage' }))

    expect(await screen.findByRole('heading', { name: 'Plan details' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Compare plans' })).not.toBeInTheDocument()
  })
})
