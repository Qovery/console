// The billing kit's pure rules, from pricing-api's web/tests/billing-kit.test.ts.
import {
  amountDue,
  cardState,
  emptyBillingInfo,
  filterInvoices,
  invoiceStatus,
  invoiceYears,
  minutesToWait,
  normalizeBillingInfo,
  runSequential,
  validOfferURL,
  validateBillingInfo,
} from './rules'
import type { CustomerInvoice } from './types'

// The same cases as the server's validOfferURL: the console links only to AWS Marketplace pages.
const OFFER_URLS: [string, boolean][] = [
  ['https://aws.amazon.com/marketplace/pp/prodview-abc123', true],
  ['https://console.aws.amazon.com/marketplace/home#/offers/offer-1', true],
  ['https://eu-west-1.console.aws.amazon.com/marketplace/home', true],
  ['HTTPS://AWS.AMAZON.COM/Marketplace/pp/x', true],
  ['http://aws.amazon.com/marketplace/pp/x', false],
  ['https://aws.amazon.com/other/page', false],
  ['https://aws.amazon.com.evil.example/marketplace', false],
  ['https://evil.example/aws.amazon.com/marketplace', false],
  ['https://evil.example/?u=https://aws.amazon.com/marketplace', false],
  ['https://aws.amazon.com@evil.example/marketplace', false],
  ['https://user@aws.amazon.com/marketplace', false],
  ['https://user:pass@aws.amazon.com/marketplace', false],
  ['https://aws.amazon.com:8443/marketplace', false],
  ['https://aws.amazon.com\\@evil.example/marketplace', false],
  ['https://notconsole.aws.amazon.com/marketplace', false],
  ['https://amazon.com/marketplace', false],
  ['https://aws.amazon.com./marketplace', false],
  ['https://ａｗｓ.amazon.com/marketplace', false],
  ['https://[::1]/marketplace', false],
  ['javascript:alert(1)//aws.amazon.com/marketplace', false],
  ['data:text/html,https://aws.amazon.com/marketplace', false],
  ['//aws.amazon.com/marketplace', false],
  ['https:aws.amazon.com/marketplace', false],
  [' https://aws.amazon.com/marketplace', false],
  ['https://aws.amazon.com/market place', false],
  ['https://aws.amazon.com/marketplace\n', false],
  ['https://aws.amazon.com/\u0000marketplace', false],
  ['https://aws.amazon.com/' + 'a'.repeat(2048) + 'marketplace', false],
  ['', false],
]

it('only AWS Marketplace pages are linked as an offer', () => {
  for (const [url, want] of OFFER_URLS) expect([url, validOfferURL(url)]).toEqual([url, want])
  expect(validOfferURL(null)).toBe(false)
  expect(validOfferURL(undefined)).toBe(false)
})

const inv = (o: Partial<CustomerInvoice>): CustomerInvoice => ({
  id: 'i',
  status: 'paid',
  date: '2026-03-01T00:00:00Z',
  due_date: null,
  paid_at: null,
  currency: 'USD',
  total: 100,
  amount_due: 0,
  amount_paid: 100,
  collectable: false,
  lines: [],
  ...o,
})

it('invoice status reads as the customer expects', () => {
  const now = new Date('2026-11-20T00:00:00Z')
  expect(invoiceStatus(inv({ status: 'paid' }), now)).toEqual({ label: 'Paid', color: 'green' })
  expect(invoiceStatus(inv({ status: 'payment_due', due_date: '2026-12-01T00:00:00Z' }), now).label).toBe('Due')
  expect(invoiceStatus(inv({ status: 'payment_due', due_date: '2026-11-01T00:00:00Z' }), now).label).toBe('Overdue')
  expect(invoiceStatus(inv({ status: 'not_paid' }), now).color).toBe('red')
  expect(invoiceStatus(inv({ status: 'voided' }), now).label).toBe('Voided')
})

it('filters, years and what is due', () => {
  const list = [
    inv({ id: 'a', date: '2026-02-01T00:00:00Z' }),
    inv({ id: 'b', status: 'payment_due', collectable: true, amount_due: 500, date: '2026-10-01T00:00:00Z' }),
    inv({
      id: 'c',
      status: 'not_paid',
      collectable: true,
      amount_due: 300,
      currency: 'EUR',
      date: '2025-12-31T23:00:00Z',
    }),
    inv({ id: 'd', status: 'voided', date: '2025-01-01T00:00:00Z' }),
  ]
  expect(invoiceYears(list)).toEqual([2026, 2025])
  expect(filterInvoices(list, 'unpaid', 'all').map((i) => i.id)).toEqual(['b', 'c'])
  expect(filterInvoices(list, 'all', 2025).map((i) => i.id)).toEqual(['c', 'd'])
  expect(filterInvoices(list, 'paid', 2026).map((i) => i.id)).toEqual(['a'])
  expect(amountDue(list)).toEqual([
    { currency: 'USD', amount: 500, count: 1 },
    { currency: 'EUR', amount: 300, count: 1 },
  ])
  expect(minutesToWait(540)).toBe(9)
  expect(minutesToWait(1)).toBe(1)
})

it('a card expires at the end of its month; expiring within 60 days', () => {
  const now = new Date('2026-11-20T00:00:00Z')
  expect(cardState({ status: 'valid', expiry_month: 10, expiry_year: 2026 }, now)).toBe('expired')
  expect(cardState({ status: 'valid', expiry_month: 11, expiry_year: 2026 }, now)).toBe('expiring')
  expect(cardState({ status: 'valid', expiry_month: 12, expiry_year: 2026 }, now)).toBe('expiring')
  expect(cardState({ status: 'valid', expiry_month: 6, expiry_year: 2027 }, now)).toBe('ok')
  expect(cardState({ status: 'expired', expiry_month: 6, expiry_year: 2030 }, now)).toBe('expired')
})

it('billing information is checked like the server does', () => {
  const ok = { ...emptyBillingInfo, email: 'ap@acme.example', country: 'fr', vat_number: 'FR 123 456 789 01' }
  expect(validateBillingInfo(ok)).toEqual({})
  expect(normalizeBillingInfo(ok).vat_number).toEqual('FR12345678901')
  expect(normalizeBillingInfo(ok).country).toBe('FR')
  const bad = validateBillingInfo({
    ...emptyBillingInfo,
    email: 'nope',
    country: 'France',
    city: 'x'.repeat(51),
    vat_number: 'FR<1>',
  })
  expect(Object.keys(bad).sort()).toEqual(['city', 'country', 'email', 'vat_number'])
  expect(validateBillingInfo(emptyBillingInfo).email).toBeTruthy()
})

it('download all runs one at a time, counts failures and stops when cancelled', async () => {
  const waits: number[] = []
  const seen: number[] = []
  const r = await runSequential(
    [1, 2, 3],
    async (n) => {
      seen.push(n)
      if (n === 2) throw new Error('x')
    },
    {
      gapMs: 800,
      sleep: async (ms) => {
        waits.push(ms)
      },
    }
  )
  expect(r).toEqual({ done: 2, failed: 1, cancelled: false })
  expect(seen).toEqual([1, 2, 3])
  expect(waits).toEqual([800, 800])
  const ac = new AbortController()
  const r2 = await runSequential(
    [1, 2, 3],
    async (n) => {
      if (n === 1) ac.abort()
    },
    { signal: ac.signal, sleep: () => Promise.resolve() }
  )
  expect(r2).toEqual({ done: 1, failed: 0, cancelled: true })
})
