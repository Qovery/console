import { type EmailPreferences, createPricingClient } from '@qovery/shared/billing-kit'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { pickConsoleCalls, usePricingClient } from '../hooks/use-pricing-client/use-pricing-client'
import {
  SettingsBillingNotifications,
  getNotificationsSettingsLinks,
  redirectLegacyBillingEmailsLink,
} from './settings-billing-notifications'

jest.mock('../hooks/use-pricing-client/use-pricing-client', () => ({
  ...jest.requireActual('../hooks/use-pricing-client/use-pricing-client'),
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

const jsonResponse = (status: number, body: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText: '',
    json: () => Promise.resolve(body),
  }) as Response

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

const mockPreferencesApi = () => {
  let current = preferences()
  const fetchMock = jest.fn((url: string, init?: RequestInit) => {
    if (!new URL(url).pathname.endsWith('/organization/org-northwind/emailPreferences')) {
      return Promise.resolve(jsonResponse(404, { code: 'NOT_FOUND', detail: 'not found' }))
    }
    if (init?.method === 'PUT') {
      const { category, enabled } = JSON.parse(String(init.body))
      current = preferences({ [category]: enabled })
    }
    return Promise.resolve(jsonResponse(200, current))
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

describe('redirectLegacyBillingEmailsLink', () => {
  const thrownBy = (search: unknown) => {
    try {
      redirectLegacyBillingEmailsLink({ params: { organizationId: 'org-1' }, search })
    } catch (error) {
      return error
    }
    return undefined
  }

  it('should send the emails link ?section=emails to Settings, Notifications, Billing', () => {
    const error = thrownBy({ section: 'emails' })

    expect(error).toEqual({
      redirect: true,
      options: {
        to: '/organization/$organizationId/settings/notifications/billing',
        params: { organizationId: 'org-1' },
        replace: true,
      },
    })
  })

  it('should keep the Usage page for any other link', () => {
    expect(thrownBy({})).toBeUndefined()
    expect(thrownBy(undefined)).toBeUndefined()
    expect(thrownBy({ proposal: '12' })).toBeUndefined()
    expect(thrownBy({ section: 'usage' })).toBeUndefined()
  })
})

describe('SettingsBillingNotifications', () => {
  it('should show the page heading and the person email preferences', async () => {
    mockPreferencesApi()
    renderWithProviders(<SettingsBillingNotifications />)

    expect(screen.getByRole('heading', { name: 'Billing notifications' })).toBeInTheDocument()
    expect(await screen.findByText('Usage and limits')).toBeInTheDocument()
    expect(screen.getByText(/sent to ada@northwind\.example/)).toBeInTheDocument()
    expect(screen.getByText('Offers')).toBeInTheDocument()
  })

  it('should keep Billing on and locked', async () => {
    mockPreferencesApi()
    renderWithProviders(<SettingsBillingNotifications />)

    await screen.findByText('Usage and limits')
    const toggles = screen.getAllByRole('switch')
    expect(toggles).toHaveLength(3)
    expect(toggles[1]).toBeDisabled()
    expect(toggles[1]).toBeChecked()
  })

  it('should save a change with the user token', async () => {
    const fetchMock = mockPreferencesApi()
    const { userEvent } = renderWithProviders(<SettingsBillingNotifications />)

    await screen.findByText('Usage and limits')
    await userEvent.click(screen.getAllByRole('switch')[2])

    const put = fetchMock.mock.calls.find(([, init]) => init?.method === 'PUT')
    expect(put?.[0]).toBe('https://billing-api.qovery.com/organization/org-northwind/emailPreferences')
    expect(JSON.parse(String(put?.[1]?.body))).toEqual({ category: 'offers', enabled: false })
    expect((put?.[1]?.headers as Record<string, string>)['Authorization']).toBe('Bearer user-token')
    expect(screen.getAllByRole('switch')[2]).not.toBeChecked()
  })

  it('should explain when the preferences cannot be read', async () => {
    jest.mocked(usePricingClient).mockReturnValue(
      pickConsoleCalls(
        createPricingClient({
          pricingApiUrl: 'https://billing-api.qovery.com',
          getToken: () => 'user-token',
          fetch: jest.fn(() =>
            Promise.resolve(jsonResponse(403, { code: 'NOT_A_MEMBER', detail: 'Not a member of this organization' }))
          ) as unknown as typeof fetch,
        })
      )
    )
    renderWithProviders(<SettingsBillingNotifications />)

    expect(await screen.findByText(/not a member/i)).toBeInTheDocument()
  })
})
