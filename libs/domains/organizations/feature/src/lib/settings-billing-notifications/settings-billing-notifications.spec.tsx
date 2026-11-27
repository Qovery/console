import type { EmailPreferences } from 'qovery-pricing-typescript-axios'
import { BillingError, type PricingClient } from '@qovery/shared/billing/data-access'
import { usePricingClient } from '@qovery/shared/billing/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import {
  SettingsBillingNotifications,
  getNotificationsSettingsLinks,
  redirectLegacyBillingEmailLinks,
} from './settings-billing-notifications'

jest.mock('@qovery/shared/billing/feature', () => ({
  ...jest.requireActual('@qovery/shared/billing/feature'),
  usePricingClient: jest.fn(),
}))
jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useDocumentTitle: jest.fn(),
}))
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-northwind' }),
  // jsdom has no Response, which TanStack's redirect builds
  redirect: (options: unknown) => ({ redirect: true, options }),
}))

const preferences = (overrides: Partial<Record<string, boolean>> = {}): EmailPreferences => ({
  email: 'ada@northwind.example',
  categories: [
    {
      category: 'usage',
      name: 'Usage and limits',
      description: 'When a limit is close or reached.',
      enabled: overrides['usage'] ?? true,
    },
    {
      category: 'billing',
      name: 'Billing',
      description: 'Spend alerts, failed payments and plan changes. Always sent to billing roles.',
      enabled: true,
      locked: true,
    },
    {
      category: 'offers',
      name: 'Offers',
      description: 'Plan and pricing offers for your organization.',
      enabled: overrides['offers'] ?? true,
    },
  ],
})

const mockPreferencesClient = () => {
  const client = {
    mode: 'live',
    publicPlans: jest.fn(),
    billingUsage: jest.fn(),
    spendLimits: jest.fn(),
    emailPreferences: jest.fn().mockResolvedValue(preferences()),
    setEmailPreference: jest.fn(async (_organizationId: string, category: string, enabled: boolean) => {
      const updated = preferences({ [category]: enabled })
      client.emailPreferences.mockResolvedValue(updated)
      return updated
    }),
  } satisfies PricingClient
  jest.mocked(usePricingClient).mockReturnValue(client)
  return client
}

describe('getNotificationsSettingsLinks', () => {
  it('should list Slack and Webhook only when the new billing pages are off', () => {
    expect(getNotificationsSettingsLinks('/organization/1/settings', false)).toEqual([
      { title: 'Slack', to: '/organization/1/settings/notifications/slack' },
      { title: 'Webhook', to: '/organization/1/settings/webhook' },
    ])
  })

  it('should add Billing when the new billing pages are on', () => {
    expect(getNotificationsSettingsLinks('/organization/1/settings', true)).toEqual([
      { title: 'Slack', to: '/organization/1/settings/notifications/slack' },
      { title: 'Webhook', to: '/organization/1/settings/webhook' },
      { title: 'Billing', to: '/organization/1/settings/notifications/billing' },
    ])
  })
})

describe('redirectLegacyBillingEmailLinks', () => {
  const thrownBy = (search: string) => {
    try {
      redirectLegacyBillingEmailLinks({ params: { organizationId: 'org-1' }, search })
    } catch (error) {
      return error
    }
    return undefined
  }

  it('should send the emails link ?section=emails to Settings, Notifications, Billing', () => {
    const error = thrownBy('?section=emails')

    expect(error).toEqual({
      redirect: true,
      options: {
        to: '/organization/$organizationId/settings/notifications/billing',
        params: { organizationId: 'org-1' },
        replace: true,
      },
    })
  })

  it('should send an earlier plan proposal link to Usage with the proposal selected', () => {
    expect(thrownBy('?proposal=12')).toEqual({
      redirect: true,
      options: {
        to: '/organization/$organizationId/settings/usage',
        params: { organizationId: 'org-1' },
        search: { proposal: 12 },
        replace: true,
      },
    })
  })

  it.each(['', '?section=usage', '?proposal=1e3', '?proposal=9007199254740993'])(
    'should keep Billing for search %s',
    (search) => {
      expect(thrownBy(search)).toBeUndefined()
    }
  )
})

describe('SettingsBillingNotifications', () => {
  it('should show the page heading and the person email preferences', async () => {
    mockPreferencesClient()
    renderWithProviders(<SettingsBillingNotifications />)

    expect(screen.getByRole('heading', { name: 'Billing notifications' })).toBeInTheDocument()
    expect(await screen.findByText('Usage and limits')).toBeInTheDocument()
    expect(screen.getByText(/sent to ada@northwind\.example/)).toBeInTheDocument()
    expect(screen.getByText('Offers')).toBeInTheDocument()
  })

  it('should keep Billing on and locked', async () => {
    mockPreferencesClient()
    renderWithProviders(<SettingsBillingNotifications />)

    await screen.findByText('Usage and limits')
    const toggles = screen.getAllByRole('switch')
    expect(toggles).toHaveLength(3)
    expect(toggles[1]).toBeDisabled()
    expect(toggles[1]).toBeChecked()
  })

  it('should save a change for the organization', async () => {
    const client = mockPreferencesClient()
    const { userEvent } = renderWithProviders(<SettingsBillingNotifications />)

    await screen.findByText('Usage and limits')
    await userEvent.click(screen.getAllByRole('switch')[2])

    expect(client.setEmailPreference).toHaveBeenCalledWith('org-northwind', 'offers', false)
    expect(screen.getAllByRole('switch')[2]).not.toBeChecked()
  })

  it('should explain when the preferences cannot be read', async () => {
    const client = mockPreferencesClient()
    client.emailPreferences.mockRejectedValue(
      new BillingError(403, 'NOT_A_MEMBER', 'Not a member of this organization')
    )
    renderWithProviders(<SettingsBillingNotifications />)

    expect(await screen.findByText(/not a member/i)).toBeInTheDocument()
  })
})
