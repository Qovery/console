import type { BillingUsage } from 'qovery-pricing-typescript-axios'
import type { PricingClient } from '@qovery/shared/billing/data-access'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BillingPage } from './billing-page'

const usage: BillingUsage = {
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
  deployments: { from: '2026-10-01', to: '2026-10-31', deployments: 0, build_minutes: 0, deploy_minutes: 0, days: [] },
  prepaid_credits: [],
  status: { status: 'ok' },
  notes: [],
}

const client = (): PricingClient => ({
  mode: 'live',
  publicPlans: jest.fn().mockReturnValue(new Promise(() => undefined)),
  billingUsage: jest.fn().mockResolvedValue(usage),
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
