import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type ReactNode } from 'react'
import { type BillingUsage, billingUsageFactoryMock, createPricingClient } from '@qovery/shared/billing-kit'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { usePricingClient } from '../hooks/use-pricing-client/use-pricing-client'
import {
  BILLING_USAGE_FEATURE_FLAG,
  BillingUsageView,
  SettingsBillingUsage,
  getBillingSettingsLinks,
} from './settings-billing-usage'

jest.mock('posthog-js/react', () => ({
  useFeatureFlagEnabled: jest.fn(),
}))
jest.mock('../hooks/use-pricing-client/use-pricing-client')
jest.mock('../settings-billing-summary/settings-billing-summary', () => ({
  SettingsBillingSummary: () => <div>Billing summary page</div>,
}))
jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useDocumentTitle: jest.fn(),
}))
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-northwind' }),
  Link: ({ children }: { children: ReactNode }) => <a href="/billing-summary">{children}</a>,
}))

const jsonResponse = (status: number, body: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText: '',
    json: () => Promise.resolve(body),
  }) as Response

const mockPricingApi = (billingUsage: () => Promise<Response>) => {
  // Any other pricing-api call fails the test through the "only reads billingUsage" assertion
  const fetchMock = jest.fn((url: string) =>
    url.endsWith('/billingUsage')
      ? billingUsage()
      : Promise.resolve(jsonResponse(404, { code: 'NOT_FOUND', detail: 'not found' }))
  )
  jest.mocked(usePricingClient).mockReturnValue(
    createPricingClient({
      pricingApiUrl: 'https://billing-api.qovery.com',
      getToken: () => 'user-token',
      fetch: fetchMock as unknown as typeof fetch,
    })
  )
  return fetchMock
}

const mockUsage = (usage: BillingUsage) => mockPricingApi(() => Promise.resolve(jsonResponse(200, usage)))

describe('BillingUsageView', () => {
  it('should call pricing-api with the user token', async () => {
    const fetchMock = mockUsage(billingUsageFactoryMock())
    renderWithProviders(<BillingUsageView />)

    expect(await screen.findByText('Growth')).toBeInTheDocument()
    const [url, init] = fetchMock.mock.calls.find(([u]) => u.endsWith('/billingUsage')) as unknown as [
      string,
      RequestInit,
    ]
    expect(url).toBe('https://billing-api.qovery.com/organization/org-northwind/billingUsage')
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer user-token')
  })

  it('should render the plan and its limits', async () => {
    mockUsage(billingUsageFactoryMock())
    renderWithProviders(<BillingUsageView />)

    expect(await screen.findByText('Growth')).toBeInTheDocument()
    expect(screen.getAllByText('Managed clusters').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Members').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Deployment minutes').length).toBeGreaterThan(0)
  })

  it('should only read billingUsage: no plan change, offers or email preferences request', async () => {
    const fetchMock = mockUsage(billingUsageFactoryMock('billing'))
    const { userEvent } = renderWithProviders(<BillingUsageView />)

    expect(await screen.findByText('Growth')).toBeInTheDocument()
    await userEvent.click(screen.getAllByRole('button', { name: 'View usage' })[0])

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://billing-api.qovery.com/organization/org-northwind/billingUsage',
    ])
    expect(
      screen.queryByRole('button', { name: /change plan|compare plans|upgrade|ask an admin/i })
    ).not.toBeInTheDocument()
  })

  it('should show amounts to billing roles', async () => {
    mockUsage(billingUsageFactoryMock('billing'))
    renderWithProviders(<BillingUsageView />)

    expect(await screen.findByText('Current bill')).toBeInTheDocument()
    expect(screen.getByText('$10,788')).toBeInTheDocument()
    expect(screen.getByText('What your plan covers')).toBeInTheDocument()
  })

  it('should hide amounts from members', async () => {
    mockUsage(billingUsageFactoryMock('member'))
    renderWithProviders(<BillingUsageView />)

    expect(await screen.findByText('Growth')).toBeInTheDocument()
    expect(screen.queryByText('Current bill')).not.toBeInTheDocument()
    expect(screen.queryByText('$10,788')).not.toBeInTheDocument()
    expect(screen.queryByText('What your plan covers')).not.toBeInTheDocument()
  })

  it('should explain an organization not linked to a billing account', async () => {
    mockPricingApi(() =>
      Promise.resolve(jsonResponse(404, { code: 'ORGANIZATION_NOT_LINKED', detail: 'no plan', status: 404 }))
    )
    renderWithProviders(<BillingUsageView />)

    expect(await screen.findByText('No plan details for this organization yet')).toBeInTheDocument()
    expect(screen.getByText('Open billing summary')).toBeInTheDocument()
  })

  it('should explain a user who is not a member', async () => {
    mockPricingApi(() =>
      Promise.resolve(jsonResponse(403, { code: 'NOT_AN_ORGANIZATION_MEMBER', detail: 'no access', status: 403 }))
    )
    renderWithProviders(<BillingUsageView />)

    expect(await screen.findByText("You do not have access to this organization's usage")).toBeInTheDocument()
  })

  it('should explain an expired session', async () => {
    mockPricingApi(() => Promise.resolve(jsonResponse(401, { code: 'UNAUTHORIZED', detail: 'no token', status: 401 })))
    renderWithProviders(<BillingUsageView />)

    expect(await screen.findByText('Your session has expired')).toBeInTheDocument()
  })

  it('should let the user retry after a network error', async () => {
    let calls = 0
    mockPricingApi(() => {
      calls += 1
      return calls <= 3
        ? Promise.reject(new TypeError('Failed to fetch'))
        : Promise.resolve(jsonResponse(200, billingUsageFactoryMock()))
    })
    const { userEvent } = renderWithProviders(<BillingUsageView />)

    expect(await screen.findByText('Plan and usage could not be loaded', {}, { timeout: 10_000 })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('Growth')).toBeInTheDocument()
  }, 15_000)
})

describe('SettingsBillingUsage', () => {
  it('should show the billing summary when the flag is off', () => {
    jest.mocked(useFeatureFlagEnabled).mockReturnValue(false)
    mockUsage(billingUsageFactoryMock())
    renderWithProviders(<SettingsBillingUsage />)

    expect(useFeatureFlagEnabled).toHaveBeenCalledWith(BILLING_USAGE_FEATURE_FLAG)
    expect(screen.getByText('Billing summary page')).toBeInTheDocument()
  })

  it('should show plan and usage when the flag is on', async () => {
    jest.mocked(useFeatureFlagEnabled).mockReturnValue(true)
    mockUsage(billingUsageFactoryMock())
    renderWithProviders(<SettingsBillingUsage />)

    expect(await screen.findByText('Growth')).toBeInTheDocument()
    expect(screen.queryByText('Billing summary page')).not.toBeInTheDocument()
  })
})

describe('getBillingSettingsLinks', () => {
  it('should hide the plan and usage entry when the flag is off', () => {
    expect(getBillingSettingsLinks('/organization/1/settings', false).map((link) => link.title)).toEqual([
      'Billing summary',
      'Billing details',
    ])
  })

  it('should list the plan and usage entry first when the flag is on', () => {
    expect(getBillingSettingsLinks('/organization/1/settings', true)).toEqual([
      { title: 'Plan & usage', to: '/organization/1/settings/billing' },
      { title: 'Billing summary', to: '/organization/1/settings/billing-summary' },
      { title: 'Billing details', to: '/organization/1/settings/billing-details' },
    ])
  })
})
