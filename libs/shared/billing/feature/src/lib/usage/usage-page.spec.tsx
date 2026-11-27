import { type PricingClient, billingUsageFactoryMock } from '@qovery/shared/billing/data-access'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { UsagePage } from './usage-page'

const readOnlyClient = (usage = billingUsageFactoryMock()): PricingClient => ({
  mode: 'live',
  publicPlans: jest.fn(),
  billingUsage: jest.fn().mockResolvedValue(usage),
  spendLimits: jest.fn().mockRejectedValue(new Error('no spend limits')),
})

describe('UsagePage', () => {
  it('should render finite allowances without feature tags', async () => {
    renderWithProviders(<UsagePage organizationId="org-northwind" client={readOnlyClient()} offers="none" />)

    expect(await screen.findByText('Growth')).toBeInTheDocument()
    expect(screen.getAllByText('Managed clusters').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Deployment minutes').length).toBeGreaterThan(0)
    expect(screen.queryByText('Single sign-on')).not.toBeInTheDocument()
  })

  it('hides unlimited allowances', async () => {
    const usage = billingUsageFactoryMock()
    usage.entitlements = usage.entitlements.map((e) => ({ ...e, value: 'unlimited' }))
    const client = { ...readOnlyClient(usage), usageHistory: jest.fn().mockReturnValue(new Promise(() => undefined)) }
    renderWithProviders(<UsagePage organizationId="org-northwind" client={client} offers="none" />)
    expect(await screen.findByText('Growth')).toBeInTheDocument()
    expect(screen.queryByText('Plan allowances')).not.toBeInTheDocument()
  })

  it('loads one usage view at a time', async () => {
    const client = {
      ...readOnlyClient(),
      usageHistory: jest.fn().mockReturnValue(new Promise(() => undefined)),
      buildUsage: jest.fn().mockReturnValue(new Promise(() => undefined)),
    }
    const { userEvent } = renderWithProviders(
      <UsagePage organizationId="org-northwind" client={client} offers="none" />
    )
    expect(await screen.findByRole('region', { name: 'Usage history' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Build and deploy usage' })).toBeInTheDocument()
    await userEvent.click(screen.getByText('Services', { exact: true }))
    expect(screen.getByRole('region', { name: 'Service usage' })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Usage history' })).not.toBeInTheDocument()
    expect(client.buildUsage).toHaveBeenCalled()
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

  it('should show the payment failed banner', async () => {
    const usage = billingUsageFactoryMock()
    usage.status = { status: 'payment_failed', grace_until: '2026-11-15', message: 'Update your card' }
    renderWithProviders(<UsagePage organizationId="org-northwind" client={readOnlyClient(usage)} offers="none" />)

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
