import type { BillingUsage, Entitlement } from 'qovery-pricing-typescript-axios'
import type { PricingClient } from '@qovery/shared/billing/data-access'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { UsagePage } from './usage-page'

const limit = {
  kind: 'limit',
  mode: 'hard',
  value: 10,
  used: 2,
  over: false,
  customer_note: '',
  lifecycle: 'ga',
  overage_unit_price: 0,
} satisfies Omit<Entitlement, 'sku' | 'name' | 'unit'>

const usage: BillingUsage = {
  organization_id: 'org-northwind',
  generated_at: '2026-11-01',
  access: 'billing',
  plan: { code: 'growth', name: 'Growth', version: 1, legacy: false },
  billing: {
    period: 'year',
    cadence: 'annual',
    currency: 'USD',
    term_start: '2026-03-30',
    term_end: '2027-03-30',
    status: 'active',
    locked: false,
  },
  entitlements: [
    { ...limit, sku: 'clusters.managed', name: 'Managed clusters', unit: 'clusters' },
    { ...limit, sku: 'members.seats', name: 'Members', unit: 'members' },
    { ...limit, sku: 'deploy.minutes', name: 'Deployment minutes', unit: 'minutes', kind: 'meter' },
    { ...limit, sku: 'sso', name: 'Single sign-on', unit: '', kind: 'feature', value: false },
  ],
  organization_usage: {},
  deployments: { from: '2026-10-01', to: '2026-10-31', deployments: 0, build_minutes: 0, deploy_minutes: 0, days: [] },
  prepaid_credits: [],
  status: { status: 'ok' },
  notes: [],
}

const readOnlyClient = (overrides: Partial<BillingUsage> = {}): PricingClient => ({
  mode: 'live',
  publicPlans: jest.fn(),
  billingUsage: jest.fn().mockResolvedValue({ ...usage, ...overrides }),
  spendLimits: jest.fn().mockRejectedValue(new Error('no spend limits')),
})

describe('UsagePage', () => {
  it('should render the plan, every limit and the features', async () => {
    renderWithProviders(<UsagePage organizationId="org-northwind" client={readOnlyClient()} offers="none" />)

    expect(await screen.findByText('Growth')).toBeInTheDocument()
    expect(screen.getAllByText('Managed clusters').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Members').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Deployment minutes').length).toBeGreaterThan(0)
    expect(screen.getByText('Single sign-on')).toBeInTheDocument()
  })

  it('should hide plan changes when the client cannot change plans', async () => {
    renderWithProviders(<UsagePage organizationId="org-northwind" client={readOnlyClient()} offers="none" />)

    expect(await screen.findByText('Growth')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /compare plans/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /change plan|ask an admin/i })).not.toBeInTheDocument()
  })

  it('should offer plan changes when the client can change plans', async () => {
    const client = {
      ...readOnlyClient(),
      planOptions: jest.fn().mockReturnValue(new Promise(() => undefined)),
      quotePlanChange: jest.fn(),
      changePlan: jest.fn(),
    }
    renderWithProviders(<UsagePage organizationId="org-northwind" client={client} offers="none" />)

    expect(await screen.findByRole('button', { name: 'Change plan' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /compare plans/i })).toBeInTheDocument()
  })

  it('should open the usage chart of a limit', async () => {
    const client = readOnlyClient({
      usage_insights: {
        from: '2026-09-01',
        to: '2026-10-31',
        series: [
          {
            sku: 'clusters.managed',
            name: 'Managed clusters',
            unit: 'clusters',
            kind: 'limit',
            included: 10,
            source: 'snapshot',
            points: [{ day: '2026-10-31', quantity: 2 }],
          },
        ],
        deployment_months: [],
        projection: [],
      },
    })
    const { userEvent } = renderWithProviders(
      <UsagePage organizationId="org-northwind" client={client} offers="none" />
    )

    await userEvent.click((await screen.findAllByRole('button', { name: 'View usage' }))[0])

    expect(await screen.findByText(/In use each day, over three months/)).toBeInTheDocument()
  })

  it('should show the payment failed banner', async () => {
    const client = readOnlyClient({
      status: { status: 'payment_failed', grace_until: '2026-11-15', message: 'Update your card' },
    })
    renderWithProviders(<UsagePage organizationId="org-northwind" client={client} offers="none" />)

    expect(await screen.findByText('Your last payment failed')).toBeInTheDocument()
  })

  it('should link to the email settings page instead of showing the preferences', async () => {
    const onManageEmails = jest.fn()
    const client = { ...readOnlyClient(), emailPreferences: jest.fn(), setEmailPreference: jest.fn() }
    const { userEvent } = renderWithProviders(
      <UsagePage organizationId="org-northwind" client={client} offers="none" onManageEmails={onManageEmails} />
    )

    expect(await screen.findByText('Email notifications')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Configure' }))

    expect(onManageEmails).toHaveBeenCalledTimes(1)
    expect(client.emailPreferences).not.toHaveBeenCalled()
  })

  it('should hide the email settings link when the client has no email preferences', async () => {
    renderWithProviders(
      <UsagePage organizationId="org-northwind" client={readOnlyClient()} offers="none" onManageEmails={jest.fn()} />
    )

    expect(await screen.findByText('Growth')).toBeInTheDocument()
    expect(screen.queryByText('Email notifications')).not.toBeInTheDocument()
  })
})
