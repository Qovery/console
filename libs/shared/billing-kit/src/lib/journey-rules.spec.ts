// The billing kit's rules for the plan change, the cancellation and the usage history
// (rules.ts), from pricing-api's web/tests/journey.test.ts.
import {
  changeBlockedText,
  changeKind,
  customRangeError,
  estimateLineLabel,
  granularityFor,
  historyCSV,
  historyTable,
  newIdempotencyKey,
  periodLabel,
  presetRange,
  quantity,
} from './rules'
import type { UsageHistory } from './types'

const today = new Date('2026-11-20T10:00:00Z')

test('period presets are whole calendar months, this one included, in UTC', () => {
  expect(presetRange('this_month', today)).toEqual({ from: '2026-11-01', to: '2026-11-20', granularity: 'day' })
  expect(presetRange('last_month', today)).toEqual({ from: '2026-10-01', to: '2026-10-31', granularity: 'day' })
  expect(presetRange('last_3', today)).toEqual({ from: '2026-09-01', to: '2026-11-20', granularity: 'month' })
  expect(presetRange('last_6', today)).toEqual({ from: '2026-06-01', to: '2026-11-20', granularity: 'month' })
  expect(presetRange('last_12', today)).toEqual({ from: '2025-12-01', to: '2026-11-20', granularity: 'month' })
  // January: last month is December of the year before.
  expect(presetRange('last_month', new Date('2027-01-05T00:00:00Z'))).toEqual({
    from: '2026-12-01',
    to: '2026-12-31',
    granularity: 'day',
  })
})

test('a custom range follows the server: dates, order, no future, 24 months at most', () => {
  expect(customRangeError('2026-01-01', '2026-03-31', today)).toBe('')
  expect(customRangeError('2024-11-20', '2026-11-20', today)).toBe('')
  expect(customRangeError('2024-11-19', '2026-11-20', today)).toMatch(/24 months/)
  expect(customRangeError('', '2026-03-31', today)).toMatch(/start/)
  expect(customRangeError('2026-03-01', 'soon', today)).toMatch(/end/)
  expect(customRangeError('2026-04-01', '2026-03-31', today)).toMatch(/after the end/)
  expect(customRangeError('2026-11-01', '2026-11-21', today)).toMatch(/future/)
  expect(granularityFor('2026-09-01', '2026-11-20')).toBe('day')
  expect(granularityFor('2026-08-01', '2026-11-20')).toBe('month')
})

test('quantities read with their unit, estimate lines without "× 1025"', () => {
  expect(quantity(1025, 'minutes')).toBe('1,025 minutes')
  expect(quantity(1, 'members')).toBe('1 member')
  expect(quantity(12.46, 'minutes')).toBe('12.5 minutes')
  expect(quantity(3, '')).toBe('3')
  const unit = (sku: string) => (({ 'deploy.minutes': 'minutes' }) as Record<string, string>)[sku] ?? ''
  expect(
    estimateLineLabel(
      {
        kind: 'overage',
        label: 'Deployment minutes above the monthly allowance',
        quantity: 1025,
        unit_amount: 10,
        amount: 10250,
        sku: 'deploy.minutes',
        meter: true,
      },
      unit
    )
  ).toBe('Deployment minutes above the monthly allowance: 1,025 minutes')
  expect(
    estimateLineLabel({
      kind: 'addon',
      label: 'Observe on one more cluster',
      quantity: 2,
      unit_amount: 4900,
      amount: 9800,
    })
  ).toBe('2 × Observe on one more cluster')
  expect(estimateLineLabel({ kind: 'plan', label: 'Growth v1', quantity: 1, unit_amount: 89900, amount: 89900 })).toBe(
    'Growth v1'
  )
})

test('what a change is, and what to do when it cannot be confirmed here', () => {
  expect(changeKind({ direction: 'upgrade', period: 'year', effective_at: 'now' }, 'month')).toBe(
    'Switch to yearly billing'
  )
  expect(changeKind({ direction: 'downgrade', period: 'month', effective_at: 'term_end' }, 'month')).toBe('Downgrade')
  expect(changeKind({ direction: 'same', period: 'month', effective_at: 'now' }, 'month')).toBe(
    'Keep your current plan'
  )
  expect(changeBlockedText({ available: true }, 'plan')).toBeNull()
  expect(changeBlockedText(undefined, 'plan')).toBeNull()
  expect(changeBlockedText({ available: false, code: 'SELF_SERVE_UNAVAILABLE' }, 'plan')?.title).toBe(
    'Contact us to change your plan'
  )
  expect(changeBlockedText({ available: false, code: 'SELF_SERVE_UNAVAILABLE' }, 'cancel')?.title).toBe(
    'Contact us to cancel'
  )
  expect(changeBlockedText({ available: false, code: 'PAYMENT_ACTIONS_UNAVAILABLE' }, 'plan')!.title).toMatch(
    /not available yet/
  )
  expect(changeBlockedText({ available: false, code: 'AWS_MARKETPLACE' }, 'cancel')!.body).toMatch(/AWS/)
  expect(changeBlockedText({ available: false, code: 'CANCELLATION_SCHEDULED' }, 'plan')?.contact).toBe(false)
  const a = newIdempotencyKey(),
    b = newIdempotencyKey()
  expect(a && b && a !== b).toBeTruthy()
})

const history: UsageHistory = {
  organization_id: 'org-a',
  access: 'billing',
  from: '2026-08-01',
  to: '2026-11-20',
  granularity: 'month',
  periods: ['2026-08', '2026-09', '2026-10', '2026-11'],
  data_since: '2026-09-12',
  organizations: [
    { id: 'org-a', name: 'Acme, Inc.' },
    { id: 'org-b', name: '=cmd|calc' },
  ],
  series: [
    {
      sku: 'deploy.minutes',
      name: 'Deployment minutes',
      unit: 'minutes',
      kind: 'meter',
      source: 'deployments',
      aggregate: 'sum',
      included: 5000,
      total: 6050.5,
      points: [
        { period: '2026-08', quantity: 0, by_organization: { 'org-a': 0, 'org-b': 0 }, no_data: true },
        { period: '2026-09', quantity: 1000, by_organization: { 'org-a': 600, 'org-b': 400 } },
        { period: '2026-10', quantity: 3000.5, by_organization: { 'org-a': 2000.5, 'org-b': 1000 } },
        { period: '2026-11', quantity: 2050, by_organization: { 'org-a': 2000, 'org-b': 50 } },
      ],
    },
    {
      sku: 'members.seats',
      name: 'Members',
      unit: 'members',
      kind: 'limit',
      source: 'snapshot',
      aggregate: 'peak',
      included: 25,
      total: 14,
      points: [
        { period: '2026-08', quantity: 0, by_organization: {}, no_data: true },
        { period: '2026-09', quantity: 10, by_organization: { 'org-a': 8, 'org-b': 2 } },
        { period: '2026-10', quantity: 14, by_organization: { 'org-a': 11, 'org-b': 3 } },
        { period: '2026-11', quantity: 12, by_organization: { 'org-a': 10, 'org-b': 3 } },
      ],
    },
  ],
  amounts: {
    source: 'invoices',
    currency: 'USD',
    total: 269700,
    months: [
      { month: '2026-08', invoiced: 0, invoices: 0 },
      { month: '2026-09', invoiced: 89900, invoices: 1 },
      { month: '2026-10', invoiced: 89900, invoices: 1 },
      { month: '2026-11', invoiced: 89900, invoices: 1 },
    ],
  },
  notes: ['No data before 2026-09-12.'],
}

test('the table: periods before the data are empty, meters add up, counts show the peak, invoices per month', () => {
  const t = historyTable(history)
  expect(t.rows.map((r) => r.cells)).toEqual([
    [null, null],
    [1000, 10],
    [3000.5, 14],
    [2050, 12],
  ])
  expect(t.totals).toEqual([6050.5, 14])
  expect(t.rows.map((r) => r.invoiced)).toEqual([0, 89900, 89900, 89900])
  expect(t.invoiced).toEqual({ currency: 'USD', total: 269700 })
  expect(t.rows[1].label).toBe('Sep 2026')
  // One organization: its own numbers, and no invoices (they are per contract).
  const b = historyTable(history, 'org-b')
  expect(b.rows.map((r) => r.cells)).toEqual([
    [null, null],
    [400, 2],
    [1000, 3],
    [50, 3],
  ])
  expect(b.invoiced).toBeNull()
  // A member's history has no amounts.
  expect(historyTable({ ...history, access: 'member', amounts: undefined }).invoiced).toBeNull()
  // Days: no invoices column (they are monthly).
  expect(historyTable({ ...history, granularity: 'day' }).invoiced).toBeNull()
  expect(periodLabel('2026-11-03', true)).toBe('Nov 3, 2026')
})

test('the CSV is the table: header, empty cells before the data, totals, money in currency units, safe cells', () => {
  expect(historyCSV(history)).toBe(
    [
      'Period,Deployment minutes (minutes),"Members (members, peak)",Invoiced (USD)',
      '2026-08,,,0.00',
      '2026-09,1000,10,899.00',
      '2026-10,3000.5,14,899.00',
      '2026-11,2050,12,899.00',
      'Total,6050.5,14,2697.00',
      '',
    ].join('\n')
  )
  // One organization: named on every row (quoted, and never read as a formula by a spreadsheet).
  const lines = historyCSV(history, 'org-b').split('\n')
  expect(lines[0]).toBe('Period,Organization,Deployment minutes (minutes),"Members (members, peak)"')
  expect(lines[2]).toBe("2026-09,'=cmd|calc,400,2")
  expect(historyCSV(history, 'org-a').split('\n')[2]).toBe('2026-09,"Acme, Inc.",600,8')
  // A member's CSV has no money.
  expect(!historyCSV({ ...history, access: 'member', amounts: undefined }).includes('Invoiced')).toBeTruthy()
})
