import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type ReactNode } from 'react'
import {
  type BillingUsage,
  type Cancellation,
  type Credits,
  type PlanOptions,
  type Quote,
  type Reactivation,
  type UsageHistoryData,
  billingUsageFactoryMock,
  createPricingClient,
} from '@qovery/shared/billing-kit'
import { renderWithProviders, screen, within } from '@qovery/shared/util-tests'
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
  Link: ({ children, to, params }: { children: ReactNode; to: string; params: { organizationId: string } }) => (
    <a href={to.replace('$organizationId', params.organizationId)}>{children}</a>
  ),
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

const usageHistory: UsageHistoryData = {
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

const credits: Credits = {
  organization_id: 'org-northwind',
  currency: 'USD',
  buy: { available: true },
  payment_method_on_file: true,
  options: [
    {
      sku: 'deploy.minutes',
      name: 'Deployment minutes',
      unit: 'minutes',
      unit_price: 16,
      allowance: 8000,
      min: 100,
      max: 156200,
      step: 100,
      packs: [1000, 5000, 10000],
    },
  ],
  balances: [
    {
      sku: 'deploy.minutes',
      name: 'Deployment minutes',
      unit: 'minutes',
      bought: 5000,
      balance: 5000,
      drawing: 0,
      remaining: 5000,
      expires_on: null,
    },
  ],
  purchases: [
    {
      id: 1,
      date: '2026-11-20T08:00:00Z',
      sku: 'deploy.minutes',
      name: 'Deployment minutes',
      unit: 'minutes',
      quantity: 5000,
      unit_price: 16,
      amount: 80000,
      currency: 'USD',
      by: 'owner@northwind.example',
      source: 'console',
      invoice_id: 'INV-7',
    },
  ],
  auto_reload: [],
}

const creditQuote = (quantity: number) => ({
  applied: false,
  quote: {
    sku: 'deploy.minutes',
    name: 'Deployment minutes',
    unit: 'minutes',
    quantity,
    annual: false,
    currency: 'USD',
    unit_price: 16,
    amount: quantity * 16,
    payg_amount: quantity * 16,
    saving: 0,
    balance_after: 5000 + quantity,
    expires_on: null,
    tax_note: 'Before tax.',
  },
  buy: { available: true },
})

const reactivation: Reactivation = {
  ended: true,
  ended_on: '2026-11-17',
  mode: 'reactivate',
  unavailable: null,
  currency: 'USD',
  period: 'year',
  last_plan: { code: 'GROWTH_2026', name: 'Growth' },
  default_plan: 'GROWTH_2026',
  plans: [
    {
      code: 'GROWTH_2026',
      name: 'Growth',
      description: '',
      rank: 2,
      prices: [
        { currency: 'USD', period: 'month', amount: 89900 },
        { currency: 'USD', period: 'year', amount: 1078800 },
      ],
    },
  ],
  payment_method_on_file: true,
  current: null,
}

const reactivationQuote = {
  plan: 'GROWTH_2026',
  name: 'Growth',
  period: 'year',
  currency: 'USD',
  charge_today: 1078800,
  starts_on: '2026-11-20',
  next_renewal_on: '2027-11-20',
  next_invoice: 1078800,
  estimated: true,
  tax_note: 'Before tax.',
}

const sentTo = (fetchMock: jest.Mock, suffix: string) =>
  (fetchMock.mock.calls as unknown as [string, RequestInit][])
    .filter(([url, init]) => url.endsWith(suffix) && init.method === 'POST')
    .map(([, init]) => ({
      body: JSON.parse(String(init.body)),
      key: (init.headers as Record<string, string>)['Idempotency-Key'],
    }))

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

  it('should draw Plan details with SettingsHeading, its buttons on the right and the alerts under it', async () => {
    mockUsage(billingUsageFactoryMock('billing'), {
      ...journeyRoutes(),
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
    renderWithProviders(<BillingUsageView />)

    // The same h1 as Invoices and Billing, in a SettingsHeading that holds the description and both buttons
    const title = await screen.findByRole('heading', { level: 1, name: 'Plan details' })
    const header = title.closest('.border-b') as HTMLElement
    expect(within(header).getByText(/Limits are shared by every organization/)).toHaveClass('max-w-2xl')
    expect(await within(header).findByRole('button', { name: 'Change plan' })).toBeInTheDocument()
    expect(within(header).getByRole('button', { name: 'Compare plans' })).toBeInTheDocument()

    const alert = await screen.findByRole('button', { name: 'View invoices' })
    expect(header.compareDocumentPosition(alert) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(header).not.toContainElement(alert)
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
    expect(paths.some((path) => /planOptions|cancellation|credits|reactivation/.test(path))).toBe(false)
    expect(screen.queryByRole('button', { name: 'Change plan' })).not.toBeInTheDocument()
  })

  it('should show prepaid credits and buy them with a quote first, then the review key', async () => {
    const fetchMock = mockUsage(billingUsageFactoryMock('billing'), {
      '/credits': (init) => {
        if (init?.method !== 'POST') return jsonResponse(200, credits)
        const body = JSON.parse(String(init.body))
        return body.dry_run
          ? jsonResponse(200, creditQuote(body.quantity))
          : jsonResponse(201, { applied: true, quote: creditQuote(body.quantity).quote, credits })
      },
    })
    const { userEvent } = renderWithProviders(<BillingUsageView />)

    expect(await screen.findByText('Prepaid credits')).toBeInTheDocument()
    expect(screen.getByText('owner@northwind.example')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Buy credits' }))
    await userEvent.click(await screen.findByRole('button', { name: /^Pay \$160 now$/ }, { timeout: 3000 }))

    const posts = sentTo(fetchMock, '/credits')
    expect(posts[0]).toEqual({ body: { sku: 'deploy.minutes', quantity: 1000, dry_run: true }, key: undefined })
    const buy = posts.find((p) => p.body.dry_run === false)
    expect(buy?.body).toEqual({ sku: 'deploy.minutes', quantity: 1000, dry_run: false })
    expect(buy?.key).toEqual(expect.any(String))
  })

  it('should price discounts with a dry run and send the request with the terms accepted', async () => {
    const view = {
      organization_id: 'org-northwind',
      availability: { available: true },
      currency: 'USD',
      period: 'year',
      price: 1078800,
      annual_price: 1078800,
      max_percent: 35,
      discounts: [
        {
          id: 'logo',
          label: 'Logo rights',
          percent: 3,
          gives: 'Your logo on qovery.com',
          requires: [],
          excludes: [],
          term_months: 0,
        },
        {
          id: 'case-study',
          label: 'Public case study',
          percent: 5,
          gives: 'A published story',
          requires: [],
          excludes: [],
          term_months: 0,
        },
      ],
      granted: [],
      requests: [],
    }
    const discountQuote = {
      ids: ['logo', 'case-study'],
      points: 8,
      percent: 8,
      max_percent: 35,
      capped: false,
      currency: 'USD',
      period: 'year',
      price_before: 1078800,
      price_after: 992496,
      saving: 86304,
      annual_before: 1078800,
      annual_after: 992496,
      discount_until: '2027-11-20',
      term_months: 0,
    }
    const fetchMock = mockUsage(billingUsageFactoryMock('billing'), {
      '/discounts': () => jsonResponse(200, view),
      '/discounts/quote': () => jsonResponse(200, discountQuote),
      '/discountRequests': () => jsonResponse(201, { ...view, discounts: [] }),
    })
    const { userEvent } = renderWithProviders(<BillingUsageView />)

    const toggle = await screen.findByRole('button', { name: 'See available discounts' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('Up to 8% off')).toBeInTheDocument()
    await userEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Hide discounts' })).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(screen.getByText('Logo rights'))
    await userEvent.click(screen.getByText('Public case study'))
    expect(await screen.findByText('$9,925')).toBeInTheDocument()
    const request = screen.getByRole('button', { name: 'Request discount' })
    expect(request).toBeDisabled()
    await userEvent.click(screen.getByText(/I agree to deliver what each discount asks for/))
    await userEvent.click(request)

    expect(sentTo(fetchMock, '/discounts/quote').at(-1)?.body).toEqual({ ids: ['logo', 'case-study'], dry_run: true })
    expect(sentTo(fetchMock, '/discountRequests')[0].body).toEqual({
      ids: ['logo', 'case-study'],
      message: '',
      accept_terms: true,
    })
  })

  it('should show members their prepaid balances, never prices or the buy button', async () => {
    const usage = {
      ...billingUsageFactoryMock('member'),
      prepaid_credits: [
        { sku: 'deploy.minutes', name: 'Deployment minutes', unit: 'minutes', balance: 5000, remaining: 4200 },
      ],
    }
    const fetchMock = mockUsage(usage, { '/credits': () => jsonResponse(200, credits) })
    renderWithProviders(<BillingUsageView />)

    expect(await screen.findByText('Prepaid credits')).toBeInTheDocument()
    expect(screen.getByText(/4,200 minutes left/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Buy credits' })).not.toBeInTheDocument()
    expect(calledPaths(fetchMock).some((path) => path.endsWith('/credits'))).toBe(false)
  })

  it('should offer to reactivate an ended subscription and confirm with the review key', async () => {
    const ended = billingUsageFactoryMock('billing')
    ended.billing = { ...ended.billing, status: 'cancelled', locked: true }
    const fetchMock = mockUsage(ended, {
      ...journeyRoutes({ available: false, code: 'SUBSCRIPTION_ENDED' }),
      '/reactivation': (init) => {
        if (init?.method !== 'POST') return jsonResponse(200, reactivation)
        return JSON.parse(String(init.body)).dry_run
          ? jsonResponse(200, { applied: false, quote: reactivationQuote, mode: 'reactivate', unavailable: null })
          : jsonResponse(200, { applied: true, status: 'reactivated', quote: reactivationQuote })
      },
    })
    const { userEvent } = renderWithProviders(<BillingUsageView />)

    expect(await screen.findByText('Your subscription ended on Nov 17, 2026')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Change plan' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Reactivate' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Review' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Reactivate and pay $10,788' }))
    expect(await screen.findByText('You are on Growth again')).toBeInTheDocument()

    const posts = sentTo(fetchMock, '/reactivation')
    expect(posts[0]).toEqual({ body: { plan: 'GROWTH_2026', period: 'year', dry_run: true }, key: undefined })
    expect(posts[1].body).toEqual({ plan: 'GROWTH_2026', period: 'year', dry_run: false })
    expect(posts[1].key).toEqual(expect.any(String))
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
    expect(screen.getByRole('link', { name: 'Open billing summary' })).toHaveAttribute(
      'href',
      '/organization/org-northwind/settings/billing-summary'
    )
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
  it('should mount plan changes, cancellation, reactivation, prepaid credits, usage history, build usage, invoice details and discounts, and leave offers and emails out', () => {
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
      'credits',
      'quoteCredits',
      'buyCredits',
      'reactivation',
      'quoteReactivation',
      'reactivate',
      'buildUsage',
      'invoices',
      'invoice',
      'discounts',
      'quoteDiscounts',
      'requestDiscounts',
      'withdrawDiscountRequest',
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
