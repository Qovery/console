import { createPricingClient, gatesQuery } from './billing-data-access'
import { billingUsageFactoryMock } from './billing-usage-factory.mock'

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
    const { client: c, sent } = setup({ status: 200, body: billingUsageFactoryMock() })

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
    expect(sent[0].headers['Authorization']).toBeUndefined()
    expect(sent[1].headers['Authorization']).toBe('Bearer t')
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

describe('createPricingClient paywall and proposal calls', () => {
  it('should send each call to its pricing-api route', async () => {
    const seen: { method: string; url: string; body?: string; key?: string }[] = []
    const fetchMock = jest.fn(async (url: string, init: RequestInit = {}) => {
      const h = init.headers as Record<string, string>
      seen.push({ method: init.method ?? 'GET', url, body: init.body as string | undefined, key: h['Idempotency-Key'] })
      return { ok: true, status: url.endsWith('/view') ? 204 : 200, json: async () => ({}) } as unknown as Response
    })
    const c = createPricingClient({
      pricingApiUrl: 'https://billing-api.example/',
      getToken: () => 'tok',
      fetch: fetchMock as unknown as typeof fetch,
    })

    await c.proposals?.('o')
    await c.viewProposal?.('o', 5)
    await c.snoozeProposal?.('o', 5, 14)
    await c.dismissProposal?.('o', 5, { reason: 'price' })
    await c.quoteProposal?.('o', 5)
    await c.acceptProposal?.('o', 5, 'review-key')
    await c.acceptProposal?.('o', 5)
    await c.gates?.('o', { actions: ['cluster.create'], skus: ['clusters.managed', 'blueprints'] })
    await c.gateEvent?.('o', { sku: 'clusters.managed', event: 'shown' })
    await c.trials?.('o')
    await c.startTrial?.('o', { sku: 'clusters.managed' })
    await c.setTrialContinue?.('o', 3, { plan: 'STARTER_2026', period: 'year' }, true)
    await c.setTrialContinue?.('o', 3, null)
    await c.quoteAddon?.('o', { code: 'additional_managed_cluster' })
    await c.buyAddon?.('o', { code: 'additional_managed_cluster', quantity: 2 }, 'buy-key')

    expect(seen.map((s) => `${s.method} ${s.url.replace('https://billing-api.example', '')}`)).toEqual([
      'GET /organization/o/proposals',
      'POST /organization/o/proposals/5/view',
      'POST /organization/o/proposals/5/snooze',
      'POST /organization/o/proposals/5/dismiss',
      'POST /organization/o/proposals/5/accept',
      'POST /organization/o/proposals/5/accept',
      'POST /organization/o/proposals/5/accept',
      'GET /organization/o/gates?actions=cluster.create&skus=clusters.managed%2Cblueprints',
      'POST /organization/o/gates/events',
      'GET /organization/o/trials',
      'POST /organization/o/trials',
      'PUT /organization/o/trials/3',
      'PUT /organization/o/trials/3',
      'POST /organization/o/addons',
      'POST /organization/o/addons',
    ])
    expect(seen[2].body).toBe('{"days":14}')
    expect(seen[4].body).toBe('{"dry_run":true}')
    expect(seen[5].body).toBe('{"dry_run":false}')
    expect(seen[5].key).toBe('review-key')
    expect(seen[6].key).toBeUndefined()
    expect(JSON.parse(seen[11].body ?? '')).toEqual({
      continue: { plan: 'STARTER_2026', period: 'year' },
      accept_auto_charge: true,
    })
    expect(JSON.parse(seen[12].body ?? '')).toEqual({ continue: null })
    expect(JSON.parse(seen[14].body ?? '')).toEqual({ code: 'additional_managed_cluster', quantity: 2, dry_run: false })
    expect(seen[14].key).toBe('buy-key')
  })

  it('should leave out empty actions and SKUs from the gates query', () => {
    expect(gatesQuery({})).toBe('')
    expect(gatesQuery({ skus: ['a'] })).toBe('skus=a')
  })
})
