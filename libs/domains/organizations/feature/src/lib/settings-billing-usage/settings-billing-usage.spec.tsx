import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type ReactNode } from 'react'
import {
  type BillingUsage,
  type Cancellation,
  type PlanOptions,
  type PricingClient,
  type Quote,
  billingUsageFactoryMock,
  createPricingClient,
} from '@qovery/shared/billing-kit'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { pickConsoleCalls, usePricingClient } from '../hooks/use-pricing-client/use-pricing-client'
import {
  BILLING_USAGE_FEATURE_FLAG,
  BillingUsageView,
  SettingsBillingUsage,
  getBillingSettingsLinks,
  hasBillingRole,
} from './settings-billing-usage'

const mockShowChat = jest.fn()
const mockNavigate = jest.fn()

jest.mock('posthog-js/react', () => ({
  useFeatureFlagEnabled: jest.fn(),
}))
jest.mock('../hooks/use-pricing-client/use-pricing-client', () => ({
  ...jest.requireActual('../hooks/use-pricing-client/use-pricing-client'),
  usePricingClient: jest.fn(),
}))
jest.mock('../settings-billing-summary/settings-billing-summary', () => ({
  SettingsBillingSummary: () => <div>Billing summary page</div>,
}))
jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useDocumentTitle: jest.fn(),
  useSupportChat: () => ({ showChat: mockShowChat }),
}))
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-northwind' }),
  useNavigate: () => mockNavigate,
  Link: ({ children }: { children: ReactNode }) => <a href="/billing-summary">{children}</a>,
}))

const jsonResponse = (status: number, body: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText: '',
    json: () => Promise.resolve(body),
  }) as Response

type Route = (init?: RequestInit) => Response

const mockPricingApi = (billingUsage: () => Promise<Response>, routes: Record<string, Route> = {}) => {
  // Any call without a route answers 404, which the kit treats as "not available"
  const fetchMock = jest.fn((url: string, init?: RequestInit) => {
    const path = new URL(url).pathname
    if (path.endsWith('/billingUsage')) return billingUsage()
    const route = Object.entries(routes).find(([suffix]) => path.endsWith(suffix))?.[1]
    return Promise.resolve(route ? route(init) : jsonResponse(404, { code: 'NOT_FOUND', detail: 'not found' }))
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

const mockUsage = (usage: BillingUsage, routes?: Record<string, Route>) =>
  mockPricingApi(() => Promise.resolve(jsonResponse(200, usage)), routes)

const calledPaths = (fetchMock: jest.Mock) => fetchMock.mock.calls.map(([url]) => new URL(url).pathname)

const quote = (to: string, total: number): Quote => ({
  direction: 'upgrade',
  from: 'growth',
  to,
  period: 'year',
  currency: 'USD',
  effective_at: 'now',
  plan_amount: total,
  total,
  projected_overage: 0,
  kept_addons: [],
  auto_addons: [],
  conflicts: [],
  can_apply: true,
  message: '',
})

const planOptions = (change: PlanOptions['change'] = { available: true }): PlanOptions => ({
  segment: 'smb',
  self_serve: true,
  currency: 'USD',
  period: 'year',
  change,
  scheduled_change: null,
  term_end: '2026-12-01T00:00:00Z',
  billing_channel: 'chargebee',
  payment_method_on_file: true,
  results: [
    {
      plan: { code: 'growth', name: 'Growth', description: '', rank: 2, public: true, legacy: false },
      version: 1,
      current: true,
      highlights: [],
    },
    {
      plan: { code: 'scale', name: 'Scale', description: '', rank: 3, public: true, legacy: false },
      version: 1,
      current: false,
      highlights: [],
      quote: quote('scale', 249900),
    },
  ],
})

const cancellation = (unavailable: Cancellation['unavailable'] = null): Cancellation => ({
  organization_name: 'Northwind',
  mode: unavailable ? 'unavailable' : 'cancel',
  unavailable,
  billing_channel: 'chargebee',
  term_end: '2026-12-01T00:00:00Z',
  ends_on: '2026-12-01T00:00:00Z',
  notice_days: 0,
  notice_deadline: null,
  support_days: 30,
  support_until: '2026-12-31T00:00:00Z',
  after_end: [],
  reasons: [{ code: 'other', label: 'Something else' }],
  current: null,
})

// The kit exports a UsageHistory component, which hides the type of the same name
type UsageHistory = Awaited<ReturnType<NonNullable<PricingClient['usageHistory']>>>

const usageHistory: UsageHistory = {
  organization_id: 'org-northwind',
  access: 'billing',
  from: '2026-11-01',
  to: '2026-11-20',
  granularity: 'day',
  periods: ['2026-11-19', '2026-11-20'],
  data_since: '2026-09-01',
  organizations: [{ id: 'org-northwind', name: 'Northwind' }],
  series: [],
  notes: [],
}

const journeyRoutes = (change?: PlanOptions['change'], unavailable?: Cancellation['unavailable']) => ({
  '/planOptions': () => jsonResponse(200, planOptions(change)),
  '/planChange': () => jsonResponse(200, { applied: false, quote: quote('scale', 249900) }),
  '/cancellation': () => jsonResponse(200, cancellation(unavailable)),
  '/usageHistory': () => jsonResponse(200, usageHistory),
})

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

  it('should send plan, cancellation and history calls to pricing-api, never offers or email preferences', async () => {
    const fetchMock = mockUsage(billingUsageFactoryMock('billing'), journeyRoutes())
    renderWithProviders(<BillingUsageView />)

    expect(await screen.findByRole('button', { name: 'Change plan' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /compare plans/i })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Cancel subscription' })).toBeInTheDocument()

    const paths = calledPaths(fetchMock)
    expect(paths).toEqual(
      expect.arrayContaining([
        '/organization/org-northwind/planOptions',
        '/organization/org-northwind/cancellation',
        '/organization/org-northwind/usageHistory',
      ])
    )
    expect(paths.some((path) => /offers|emailPreferences|upgradeRequests/.test(path))).toBe(false)
    for (const [url, init] of fetchMock.mock.calls as unknown as [string, RequestInit][]) {
      expect(url.startsWith('https://billing-api.qovery.com/organization/org-northwind/')).toBe(true)
      expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer user-token')
    }
  })

  it('should quote a plan change with a dry run before anything is applied', async () => {
    const fetchMock = mockUsage(billingUsageFactoryMock('billing'), journeyRoutes())
    const { userEvent } = renderWithProviders(<BillingUsageView />)

    await userEvent.click(await screen.findByRole('button', { name: 'Change plan' }))
    await userEvent.click(await screen.findByRole('radio', { name: /scale/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Review' }))

    const quoteCall = fetchMock.mock.calls.find(([url]) => url.endsWith('/planChange')) as unknown as [
      string,
      RequestInit,
    ]
    expect(quoteCall[1].method).toBe('POST')
    expect(JSON.parse(String(quoteCall[1].body))).toMatchObject({ plan: 'scale', dry_run: true })
    expect(fetchMock.mock.calls.filter(([url]) => url.endsWith('/planChange'))).toHaveLength(1)
  })

  it('should open the support chat when a change or a cancellation needs sales', async () => {
    mockShowChat.mockClear()
    mockUsage(
      billingUsageFactoryMock('billing'),
      journeyRoutes(
        { available: false, code: 'SELF_SERVE_UNAVAILABLE' },
        { available: false, code: 'SELF_SERVE_UNAVAILABLE' }
      )
    )
    const { userEvent } = renderWithProviders(<BillingUsageView />)

    await userEvent.click(await screen.findByRole('button', { name: 'Contact us to cancel' }))
    expect(mockShowChat).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByRole('button', { name: 'Change plan' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Contact us' }))
    expect(mockShowChat).toHaveBeenCalledTimes(2)
  })

  it('should show the overdue alert once, under the page heading, and link it to the invoices page', async () => {
    mockNavigate.mockClear()
    mockUsage(billingUsageFactoryMock('billing'), {
      '/invoices': () =>
        jsonResponse(200, {
          invoices: [
            {
              id: 'INV-2026-0042',
              status: 'payment_due',
              date: '2026-11-01T00:00:00Z',
              due_date: '2026-11-01T00:00:00Z',
              paid_at: null,
              currency: 'USD',
              total: 89900,
              amount_due: 89900,
              amount_paid: 0,
              collectable: true,
              lines: [],
            },
          ],
          next_offset: '',
          billing_channel: 'chargebee',
          actions_available: true,
        }),
    })
    const { userEvent } = renderWithProviders(<BillingUsageView />)

    // findByRole fails when the alert shows twice
    await userEvent.click(await screen.findByRole('button', { name: 'View invoices' }))
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/settings/invoices',
      params: { organizationId: 'org-northwind' },
    })
  })

  it('should not read plan options or the cancellation for members', async () => {
    const fetchMock = mockUsage(billingUsageFactoryMock('member'), journeyRoutes())
    renderWithProviders(<BillingUsageView />)

    expect(await screen.findByText('Growth')).toBeInTheDocument()
    const paths = calledPaths(fetchMock)
    expect(paths.some((path) => /planOptions|cancellation/.test(path))).toBe(false)
    expect(screen.queryByRole('button', { name: 'Change plan' })).not.toBeInTheDocument()
  })

  it('should show amounts to billing roles', async () => {
    mockUsage(billingUsageFactoryMock('billing'))
    renderWithProviders(<BillingUsageView />)

    expect(await screen.findByText('Estimated bill')).toBeInTheDocument()
    expect(screen.getByText('$10,788')).toBeInTheDocument()
    expect(screen.getByText('What your plan covers')).toBeInTheDocument()
  })

  it('should hide amounts from members', async () => {
    mockUsage(billingUsageFactoryMock('member'))
    renderWithProviders(<BillingUsageView />)

    expect(await screen.findByText('Growth')).toBeInTheDocument()
    expect(screen.queryByText('Estimated bill')).not.toBeInTheDocument()
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

describe('pickConsoleCalls', () => {
  it('should mount plan changes, cancellation and usage history, and leave offers and emails out', () => {
    const calls = pickConsoleCalls(
      createPricingClient({
        pricingApiUrl: 'https://billing-api.qovery.com',
        getToken: () => 'user-token',
        fetch: jest.fn(),
      })
    )

    for (const name of [
      'planOptions',
      'quotePlanChange',
      'changePlan',
      'keepPlan',
      'cancellation',
      'cancel',
      'keepSubscription',
      'usageHistory',
    ] as const) {
      expect(calls[name]).toEqual(expect.any(Function))
    }
    for (const name of ['offers', 'offerEvent', 'acceptOffer', 'requestUpgrade', 'emailPreferences'] as const) {
      expect(calls[name]).toBeUndefined()
    }
  })
})

describe('getBillingSettingsLinks', () => {
  it('should keep billing summary and billing details when the flag is off', () => {
    expect(getBillingSettingsLinks('/organization/1/settings', false, true)).toEqual([
      { title: 'Billing summary', to: '/organization/1/settings/billing-summary' },
      { title: 'Billing details', to: '/organization/1/settings/billing-details' },
    ])
  })

  it('should list usage, invoices and billing for billing roles when the flag is on', () => {
    expect(getBillingSettingsLinks('/organization/1/settings', true, true)).toEqual([
      { title: 'Usage', to: '/organization/1/settings/billing' },
      { title: 'Invoices', to: '/organization/1/settings/invoices' },
      { title: 'Billing', to: '/organization/1/settings/billing-settings' },
    ])
  })

  it('should only list usage for other roles when the flag is on', () => {
    expect(getBillingSettingsLinks('/organization/1/settings', true, false)).toEqual([
      { title: 'Usage', to: '/organization/1/settings/billing' },
    ])
  })
})

describe('hasBillingRole', () => {
  it.each(['owner', 'admin', 'billing'])('should accept the %s role of the organization', (role) => {
    expect(hasBillingRole([`organization:org-1:${role}`], 'org-1')).toBe(true)
  })

  it('should accept Qovery admins', () => {
    expect(hasBillingRole(['admin'], 'org-1')).toBe(true)
  })

  it.each([
    [['organization:org-1:viewer']],
    [['organization:org-1:devops']],
    [['organization:org-2:owner']],
    [['organization:org-10:owner']],
    [['organization:org-1:owner-custom']],
    [['xorganization:org-1:admin']],
    [[]],
  ])('should refuse %j', (roles) => {
    expect(hasBillingRole(roles, 'org-1')).toBe(false)
  })
})
