import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { type PricingClient } from '../data-access/client'
import { billingUsageFactoryMock } from './billing-usage-factory.mock'
import { UsagePage } from './usage-page'

const readOnlyClient = (usage = billingUsageFactoryMock()): PricingClient => ({
  mode: 'live',
  publicPlans: jest.fn(),
  billingUsage: jest.fn().mockResolvedValue(usage),
  spendLimits: jest.fn().mockRejectedValue(new Error('no spend limits')),
})

describe('UsagePage', () => {
  it('should render the plan, every limit and the features', async () => {
    renderWithProviders(<UsagePage organizationId="org-northwind" client={readOnlyClient()} offers="none" />)

    expect(await screen.findByText('Growth')).toBeInTheDocument()
    expect(screen.getAllByText('Managed clusters').length).toBeGreaterThan(0)
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
    const { userEvent } = renderWithProviders(
      <UsagePage organizationId="org-northwind" client={readOnlyClient()} offers="none" />
    )

    await userEvent.click((await screen.findAllByRole('button', { name: 'View usage' }))[0])

    expect(await screen.findByText(/In use each day, over three months/)).toBeInTheDocument()
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
