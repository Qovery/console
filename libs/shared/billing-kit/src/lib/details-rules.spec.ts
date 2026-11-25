// The billing kit's rules for invoice details, build usage, discounts and payment methods, and the
// calls the pricing-api client sends, from pricing-api's web/tests (invoice-details, build-usage,
// discounts).
import { buildUsageQuery, createPricingClient } from './client'
import {
  amount,
  buildDuration,
  buildRange,
  buildServiceRows,
  buildSizeColor,
  changeKind,
  currentDiscountRequest,
  discountPercent,
  discountSelectable,
  discountsUpTo,
  invoiceDetailsCSV,
  lineKindLabel,
  localDate,
  matchesStatus,
  paymentMethodLabel,
  toggleDiscount,
  usageCoverageText,
  usageDays,
  validAwsAccountId,
} from './rules'
import type { BuildServiceUsage, CustomerInvoice, InvoiceDetails, InvoiceLineUsage, PaymentMethod } from './types'

const usage = (over: Partial<InvoiceLineUsage> = {}): InvoiceLineUsage => ({
  sku: 'deploy.minutes',
  name: 'Deployment minutes',
  unit: 'minutes',
  from: '2026-10-01',
  to: '2026-10-02',
  available: 'complete',
  since: '2026-08-01',
  source: 'billed',
  aggregate: 'sum',
  total: 9000,
  billed: 1000,
  not_billed: 8000,
  days: [
    { day: '2026-10-01', quantity: 4000, organizations: { 'org-a': 3000, 'org-b': 1000 } },
    { day: '2026-10-02', quantity: 5000, organizations: { 'org-a': 5000, 'org-b': 0 } },
  ],
  organizations: [
    { organization_id: 'org-a', name: 'Prod', quantity: 8000 },
    { organization_id: 'org-b', name: '=HYPERLINK("x")', quantity: 1000 },
  ],
  builds: {
    available: 'complete',
    since: '2026-08-01',
    note: '',
    by_size: [],
    services: [
      {
        organization_id: 'org-a',
        organization: 'Prod',
        name: 'api',
        type: 'APPLICATION',
        builds: 12,
        failed_builds: 1,
        deployments: 12,
        build_minutes: 60,
        counted_build_minutes: 120,
        deploy_minutes: 20,
        sizes: ['Large', 'Standard'],
      },
    ],
  },
  notes: [],
  ...over,
})

const invoice = (): InvoiceDetails => ({
  id: 'INV-42',
  status: 'paid',
  date: '2026-11-01T00:00:00Z',
  due_date: null,
  paid_at: '2026-11-02T00:00:00Z',
  currency: 'USD',
  period_from: '2026-11-01T00:00:00Z',
  period_to: '2026-12-01T00:00:00Z',
  subtotal: 105900,
  discounts: 8990,
  discount_lines: [{ description: 'Launch coupon', amount: 8990 }],
  tax: 1234,
  total: 98144,
  amount_paid: 98144,
  amount_due: 0,
  collectable: false,
  billing_channel: 'chargebee',
  actions_available: false,
  notes: [],
  lines: [
    {
      kind: 'plan',
      label: 'Growth plan',
      description: 'Growth',
      quantity: 1,
      unit_price: 89900,
      amount: 89900,
      discount: 0,
      net: 89900,
      from: '2026-11-01T00:00:00Z',
      to: '2026-12-01T00:00:00Z',
    },
    {
      kind: 'usage',
      label: 'Deployment minutes above your plan',
      description: 'x',
      sku: 'deploy.minutes',
      quantity: 1000,
      unit: 'minutes',
      unit_price: 16,
      amount: 16000,
      discount: 0,
      net: 16000,
      from: '2026-10-01T00:00:00Z',
      to: '2026-10-03T00:00:00Z',
      usage: usage(),
    },
  ],
})

describe('invoice details', () => {
  it('should export every line, the totals, each usage day per organization and the builds per service', () => {
    const csv = invoiceDetailsCSV(invoice())
    const rows = csv.trim().split('\n')

    expect(rows[0].split(',')[0]).toBe('Invoice')
    expect(rows[0]).toContain('Amount (USD)')
    expect(rows.filter((r) => r.split(',')[1] === 'line')).toHaveLength(2)
    expect(
      rows.some((r) =>
        r.startsWith('INV-42,line,Growth plan,Plan,2026-11-01,2026-12-01,,,,,1,,899.00,899.00,0.00,899.00')
      )
    ).toBe(true)
    expect(rows.some((r) => r.startsWith('INV-42,discount,Launch coupon,') && r.includes('-89.90'))).toBe(true)
    expect(rows.some((r) => r.startsWith('INV-42,tax,Tax,') && r.includes('12.34'))).toBe(true)
    expect(rows.some((r) => r.startsWith('INV-42,total,Total,') && r.includes('981.44'))).toBe(true)

    const days = rows.filter((r) => r.split(',')[1] === 'usage_day')
    expect(days).toHaveLength(4)
    expect(days.some((r) => r.includes(',2026-10-01,Prod,,,3000,minutes,'))).toBe(true)
    // A name a spreadsheet would read as a formula is quoted and defused
    expect(days.some((r) => r.includes(`"'=HYPERLINK(""x"")"`))).toBe(true)
    expect(csv).not.toContain(',=HYPERLINK')

    const builds = rows.filter((r) => r.split(',')[1] === 'build_service')
    expect(builds).toHaveLength(1)
    expect(builds[0]).toContain(',api,Large; Standard,')
    expect(builds[0].endsWith(',12,60,120,20')).toBe(true)
  })

  it('should export a usage day as one row under the organization name when there is one organization', () => {
    const inv = invoice()
    inv.lines[1].usage = usage({
      organizations: [{ organization_id: 'org-a', name: 'Prod', quantity: 9000 }],
      days: [{ day: '2026-10-01', quantity: 9000 }],
    })

    const days = invoiceDetailsCSV(inv)
      .trim()
      .split('\n')
      .filter((r) => r.split(',')[1] === 'usage_day')

    expect(days.map((r) => r.split(',').slice(6, 12))).toEqual([['2026-10-01', 'Prod', '', '', '9000', 'minutes']])
  })

  it('should split usage days per organization when there are several', () => {
    const rows = usageDays(usage())

    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual({ day: '2026-10-01', label: 'Oct 1', quantity: 4000, 'org-a': 3000, 'org-b': 1000 })
    expect(
      usageDays(usage({ organizations: [{ organization_id: 'org-a', name: 'Prod', quantity: 9000 }] }))[0]['org-a']
    ).toBe(undefined)
  })

  it('should say when the usage record does not cover the period', () => {
    expect(usageCoverageText(usage())).toBe('')
    expect(usageCoverageText(usage({ available: 'partial', since: '2026-10-02' }))).toMatch(
      /recorded from 2026-10-02 on/
    )
    expect(usageCoverageText(usage({ available: 'none', since: '2026-12-01' }))).toMatch(/not available.*2026-12-01/)
    expect(usageCoverageText(usage({ available: 'none', since: null }))).toMatch(/not available/)
  })

  it('should name line kinds, and keep an unknown kind as is', () => {
    expect(lineKindLabel('addon')).toBe('Add-on')
    expect(lineKindLabel('charge')).toBe('One-off charge')
    expect(lineKindLabel('other')).toBe('other')
  })
})

describe('dates, amounts and plan changes', () => {
  it('should read invoice dates in UTC and amounts in cents', () => {
    expect(localDate('2026-11-01T00:00:00Z', 'en-US')).toBe('Nov 1, 2026')
    expect(localDate(null)).toBe('')
    expect(amount(98144, 'USD', 'en-US')).toBe('$981.44')
  })

  it('should describe a plan or billing period change', () => {
    expect(changeKind({ direction: 'same', period: 'month', effective_at: '' }, 'month')).toBe('Keep your current plan')
    expect(changeKind({ direction: 'upgrade', period: 'year', effective_at: '' }, 'month')).toBe(
      'Switch to yearly billing'
    )
    expect(changeKind({ direction: 'upgrade', period: 'month', effective_at: '' }, 'year')).toBe(
      'Switch to monthly billing'
    )
    expect(changeKind({ direction: 'downgrade', period: 'month', effective_at: '' }, 'month')).toBe('Downgrade')
    expect(changeKind({ direction: 'upgrade', period: 'month', effective_at: '' }, 'month')).toBe('Upgrade')
  })

  it('should accept 12-digit AWS account ids only', () => {
    expect(validAwsAccountId('123456789012')).toBe(true)
    expect(validAwsAccountId('12345678901')).toBe(false)
    expect(validAwsAccountId('12345678901a')).toBe(false)
  })

  it('should match invoices on the all filter', () => {
    expect(matchesStatus({ status: 'paid' } as CustomerInvoice, 'all')).toBe(true)
  })
})

describe('payment methods', () => {
  const pm = (over: Partial<PaymentMethod>) => ({ type: 'card', ...over }) as PaymentMethod

  it('should name cards by brand, bank accounts and other methods', () => {
    expect(paymentMethodLabel(pm({ brand: 'visa', last4: '4242' }))).toBe('Visa ending in 4242')
    expect(paymentMethodLabel(pm({ brand: 'some_brand', last4: '1111' }))).toBe('some brand ending in 1111')
    expect(paymentMethodLabel(pm({}))).toBe('Card ending in ····')
    expect(paymentMethodLabel(pm({ type: 'direct_debit', last4: '0001' }))).toBe('Bank account ending in 0001')
    expect(paymentMethodLabel(pm({ type: 'paypal_express_checkout' }))).toBe('Paypal express checkout')
  })
})

describe('build usage', () => {
  const svc = (
    id: string,
    name: string,
    type: string,
    builds: number,
    counted: number,
    sizes: string[],
    cost = 0
  ): BuildServiceUsage => ({
    service_id: id,
    organization_id: 'org',
    name,
    type,
    builds,
    failed_builds: 0,
    deployments: builds + 1,
    build_minutes: counted,
    counted_build_minutes: counted,
    deploy_minutes: 1,
    avg_build_seconds: 60,
    p95_build_seconds: 90,
    sizes,
    cost,
    share: 0,
    trend: [],
    failed_counted_minutes: 0,
  })

  it('should cover the last 30 days day by day, and the history presets otherwise', () => {
    const today = new Date('2026-11-20T15:00:00Z')

    expect(buildRange('last_30', today)).toEqual({ from: '2026-10-22', to: '2026-11-20', granularity: 'day' })
    expect(buildRange('this_month', today)).toEqual({ from: '2026-11-01', to: '2026-11-20', granularity: 'day' })
    expect(buildRange('last_12', today)).toEqual({ from: '2025-12-01', to: '2026-11-20', granularity: 'month' })
  })

  it('should read build durations as seconds, minutes or hours', () => {
    expect(buildDuration(45)).toBe('45 s')
    expect(buildDuration(185)).toBe('3 min 05 s')
    expect(buildDuration(3720)).toBe('1 h 02 min')
  })

  it('should give each builder size its color, no builder and unknown apart', () => {
    const cat = ['standard', 'large', 'xlarge']

    expect(buildSizeColor('standard', cat)).toBe('var(--brand-9)')
    expect(buildSizeColor('large', cat)).toBe('var(--info-9)')
    expect(buildSizeColor('none', cat)).not.toBe(buildSizeColor('unknown', cat))
    expect(buildSizeColor('4xlarge+', cat)).toBe('var(--negative-9)')
  })

  it('should filter and sort the services table, time not attributed to a service last', () => {
    const rows = [
      svc('', 'Not attributed to a service', '', 3, 500, ['unknown']),
      svc('a', 'api', 'APPLICATION', 10, 200, ['large'], 900),
      svc('w', 'web', 'APPLICATION', 4, 40, ['standard'], 100),
      svc('d', 'db', 'DATABASE', 0, 0, []),
      svc('j', 'cron', 'JOB', 2, 40, ['standard'], 50),
    ]
    const all = { q: '', type: '', size: '', built: 'all' as const }
    const byName = { key: 'name' as const, desc: false }
    const names = (s: BuildServiceUsage[]) => s.map((x) => x.name)

    expect(names(buildServiceRows([...rows], all, { key: 'counted_build_minutes', desc: true }))).toEqual([
      'api',
      'cron',
      'web',
      'db',
      'Not attributed to a service',
    ])
    expect(names(buildServiceRows([...rows], all, byName))).toEqual([
      'api',
      'cron',
      'db',
      'web',
      'Not attributed to a service',
    ])
    expect(
      buildServiceRows([...rows], all, { key: 'cost', desc: true })
        .map((s) => s.service_id)
        .slice(0, 2)
    ).toEqual(['a', 'w'])
    expect(names(buildServiceRows([...rows], { ...all, q: 'WE' }, byName))).toEqual(['web'])
    expect(names(buildServiceRows([...rows], { ...all, type: 'APPLICATION' }, byName))).toEqual(['api', 'web'])
    expect(names(buildServiceRows([...rows], { ...all, size: 'standard' }, byName))).toEqual(['cron', 'web'])
    expect(names(buildServiceRows([...rows], { ...all, built: 'not_built' }, byName))).toEqual(['db'])
    expect(names(buildServiceRows([...rows], { ...all, built: 'built' }, byName))).toEqual([
      'api',
      'cron',
      'web',
      'Not attributed to a service',
    ])
  })

  it('should name the period and, for a drill, the service (empty included) in the query', () => {
    expect(buildUsageQuery({ from: '2026-11-01', to: '2026-11-20' })).toBe('from=2026-11-01&to=2026-11-20')
    expect(buildUsageQuery({ from: '2026-11-01', to: '2026-11-20', granularity: 'day', service: 'abc' })).toBe(
      'from=2026-11-01&to=2026-11-20&granularity=day&service=abc'
    )
    expect(buildUsageQuery({ from: '2026-11-01', to: '2026-11-20', service: '' })).toBe(
      'from=2026-11-01&to=2026-11-20&service='
    )
  })
})

describe('discounts', () => {
  const types = [
    { id: 'logo', percent: 3, requires: [], excludes: [] },
    { id: 'case-study', percent: 5, requires: [], excludes: [] },
    { id: 'multi-year-2', percent: 5, requires: [], excludes: ['multi-year-3'] },
    { id: 'multi-year-3', percent: 12, requires: [], excludes: ['multi-year-2'] },
    { id: 'term-upfront', percent: 5, requires: ['multi-year-2', 'multi-year-3'], excludes: [] },
    { id: 'reference', percent: 3, requires: [], excludes: [] },
    { id: 'design-partner', percent: 3, requires: [], excludes: [] },
    { id: 'speaking', percent: 2, requires: [], excludes: [] },
    { id: 'fast-close', percent: 5, requires: [], excludes: [] },
  ]

  it('should need a multi-year term, chosen or already granted, to pay up front', () => {
    const upfront = types[4]

    expect(discountSelectable(upfront, [])).toBe(false)
    expect(discountSelectable(upfront, ['multi-year-3'])).toBe(true)
    expect(discountSelectable(upfront, [], ['multi-year-2'])).toBe(true)
    expect(toggleDiscount(types, [], 'term-upfront')).toEqual([])
    expect(toggleDiscount(types, [], 'unknown')).toEqual([])
  })

  it('should keep two and three years exclusive, and drop the prepayment with the term', () => {
    let s = toggleDiscount(types, [], 'multi-year-2')
    s = toggleDiscount(types, s, 'term-upfront')
    expect(s).toEqual(['multi-year-2', 'term-upfront'])

    s = toggleDiscount(types, s, 'multi-year-3')
    expect(s).toEqual(['term-upfront', 'multi-year-3'])

    s = toggleDiscount(types, s, 'multi-year-3')
    expect(s).toEqual([])
    expect(toggleDiscount(types, ['logo'], 'logo')).toEqual([])
  })

  it('should add points up, never compound them, and stop at the ceiling', () => {
    expect(discountPercent(types, ['logo', 'case-study'], 35)).toEqual({ points: 8, percent: 8, capped: false })
    const all = types.filter((t) => t.id !== 'multi-year-2').map((t) => t.id)
    expect(discountPercent(types, all, 35)).toEqual({ points: 38, percent: 35, capped: true })
  })

  it('should show the request under review first, else the latest decided one', () => {
    const r = (id: number, status: string) => ({ id, status, requested_at: `2026-11-0${id}` })

    expect(currentDiscountRequest([r(3, 'declined'), r(2, 'open')])?.id).toBe(2)
    expect(currentDiscountRequest([r(3, 'withdrawn'), r(2, 'declined')])?.id).toBe(2)
    expect(currentDiscountRequest([r(1, 'declined'), r(3, 'approved')])?.id).toBe(3)
    expect(currentDiscountRequest([r(1, 'withdrawn')])).toBeUndefined()
  })

  it('should say how much the levers on offer can save', () => {
    expect(discountsUpTo(types, 35)).toBe(35)
    expect(
      discountsUpTo(
        types.filter((t) => ['logo', 'case-study'].includes(t.id)),
        35
      )
    ).toBe(8)
    expect(
      discountsUpTo(
        types.filter((t) => ['multi-year-2', 'multi-year-3', 'term-upfront'].includes(t.id)),
        35
      )
    ).toBe(17)
    expect(
      discountsUpTo(
        types.filter((t) => t.id === 'term-upfront'),
        35,
        ['multi-year-2']
      )
    ).toBe(5)
  })
})

describe('createPricingClient', () => {
  const setup = (response: { status: number; body?: unknown; retryAfter?: string } = { status: 200, body: {} }) => {
    const sent: { url: string; method: string; headers: Record<string, string>; body?: unknown }[] = []
    const fetchMock = jest.fn(async (url: string, init: RequestInit = {}) => {
      sent.push({
        url,
        method: init.method ?? 'GET',
        headers: init.headers as Record<string, string>,
        body: init.body ? JSON.parse(String(init.body)) : undefined,
      })
      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        statusText: 'Too Many Requests',
        headers: { get: (name: string) => (name === 'Retry-After' ? response.retryAfter ?? null : null) },
        json: () => Promise.resolve(response.body),
      } as unknown as Response
    })
    const client = createPricingClient({
      pricingApiUrl: 'https://billing-api.example/',
      getToken: () => 't',
      fetch: fetchMock as unknown as typeof fetch,
    })
    return { client, sent }
  }

  it('should send each read and change to its pricing-api route', async () => {
    const { client: c, sent } = setup()

    await c.publicPlans()
    await c.billingUsage('o')
    await c.spendLimits?.('o')
    await c.planOptions?.('o')
    await c.quotePlanChange?.('o', 'growth', 'year')
    await c.changePlan?.('o', 'growth', 'year', 'key-1')
    await c.keepPlan?.('o')
    await c.cancellation?.('o')
    await c.keepSubscription?.('o')
    await c.credits?.('o')
    await c.reactivation?.('o')
    await c.quoteReactivation?.('o', 'growth', 'month')
    await c.reactivate?.('o', 'growth', 'month', 'key-2')
    await c.usageHistory?.('o', { from: '2026-01-01', to: '2026-02-01', granularity: 'month' })
    await c.buildUsage?.('o', { from: '2026-01-01', to: '2026-02-01' })
    await c.offers?.('o')
    await c.acceptOffer?.('o', 5)
    await c.emailPreferences?.('o')
    await c.setEmailPreference?.('o', 'usage', false)
    await c.invoices?.('o')
    await c.invoices?.('o', { limit: 10, offset: 'next' })
    await c.invoice?.('o', 'INV/1')
    await c.invoicePdf?.('o', 'INV-1')
    await c.collectInvoice?.('o', 'INV-1', 'collect-key')
    await c.paymentMethods?.('o')
    await c.paymentMethodSession?.('o', 'https://console.qovery.com/back')
    await c.paymentMethodSession?.('o')
    await c.billingInfo?.('o')
    await c.awsMarketplace?.('o')
    await c.discounts?.('o')
    await c.quoteDiscounts?.('o', ['logo'])
    await c.requestDiscounts?.('o', { ids: ['logo'], accept_terms: true })
    await c.withdrawDiscountRequest?.('o', 7)

    expect(sent.map((s) => `${s.method} ${s.url.replace('https://billing-api.example', '')}`)).toEqual([
      'GET /public/v1/plans',
      'GET /organization/o/billingUsage',
      'GET /organization/o/spendLimits',
      'GET /organization/o/planOptions',
      'POST /organization/o/planChange',
      'POST /organization/o/planChange',
      'DELETE /organization/o/planChange/scheduled',
      'GET /organization/o/cancellation',
      'DELETE /organization/o/cancellation',
      'GET /organization/o/credits',
      'GET /organization/o/reactivation',
      'POST /organization/o/reactivation',
      'POST /organization/o/reactivation',
      'GET /organization/o/usageHistory?from=2026-01-01&to=2026-02-01&granularity=month',
      'GET /organization/o/buildUsage?from=2026-01-01&to=2026-02-01',
      'GET /organization/o/offers',
      'POST /organization/o/offers/5/accept',
      'GET /organization/o/emailPreferences',
      'PUT /organization/o/emailPreferences',
      'GET /organization/o/invoices',
      'GET /organization/o/invoices?limit=10&offset=next',
      'GET /organization/o/invoices/INV%2F1',
      'GET /organization/o/invoices/INV-1/pdf',
      'POST /organization/o/invoices/INV-1/collect',
      'GET /organization/o/paymentMethods',
      'POST /organization/o/paymentMethods/session',
      'POST /organization/o/paymentMethods/session',
      'GET /organization/o/billingInfo',
      'GET /organization/o/awsMarketplace',
      'GET /organization/o/discounts',
      'POST /organization/o/discounts/quote',
      'POST /organization/o/discountRequests',
      'DELETE /organization/o/discountRequests/7',
    ])
    // The public plans are read without the user's token, everything else with it
    expect(sent[0].headers.Authorization).toBeUndefined()
    expect(sent[1].headers.Authorization).toBe('Bearer t')
    // A GET has no Content-Type, so the browser sends it without a CORS preflight
    expect(sent[1].headers['Content-Type']).toBeUndefined()
    expect(sent[4].body).toEqual({ plan: 'growth', period: 'year', dry_run: true })
    expect(sent[5].body).toEqual({ plan: 'growth', period: 'year', dry_run: false })
    expect(sent[5].headers['Idempotency-Key']).toBe('key-1')
    expect(sent.find((s) => s.url.endsWith('/collect'))?.headers['Idempotency-Key']).toBe('collect-key')
    expect(sent[25].body).toEqual({ redirect_url: 'https://console.qovery.com/back' })
    expect(sent[26].body).toEqual({})
    expect(sent[31].body).toEqual({ ids: ['logo'], message: '', accept_terms: true })
  })

  it('should throw a billing error with the code, the field and the delay to wait', async () => {
    const { client } = setup({
      status: 429,
      body: { code: 'RATE_LIMITED', detail: 'Slow down', field: 'plan' },
      retryAfter: '30',
    })

    await expect(client.billingUsage('o')).rejects.toMatchObject({
      status: 429,
      code: 'RATE_LIMITED',
      message: 'Slow down',
      field: 'plan',
      retryAfter: 30,
    })
  })

  it('should fall back to the status text when the error has no body', async () => {
    const { client } = setup({ status: 429 })

    await expect(client.billingUsage('o')).rejects.toMatchObject({
      code: 'ERROR',
      message: 'Too Many Requests',
      retryAfter: undefined,
    })
  })
})
