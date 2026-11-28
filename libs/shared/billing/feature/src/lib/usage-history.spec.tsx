import type { UsageHistoryData } from 'qovery-pricing-typescript-axios'
import type { PricingClient } from '@qovery/shared/billing/data-access'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BuildUsage } from './build-usage'
import { UsageHistory } from './usage-history'

const history: UsageHistoryData = {
  organization_id: 'org-a',
  access: 'member',
  from: '2026-09-01',
  to: '2026-11-27',
  granularity: 'month',
  periods: ['2026-11'],
  data_since: null,
  notes: [],
  organizations: [
    { id: 'org-a', name: 'Acme' },
    { id: 'org-b', name: 'Other' },
  ],
  series: [
    {
      sku: 'deploy.minutes',
      name: 'Deployment minutes',
      unit: 'minutes',
      kind: 'meter',
      source: 'deployments',
      aggregate: 'sum',
      total: 100,
      points: [{ period: '2026-11', quantity: 100, by_organization: { 'org-a': 60, 'org-b': 40 } }],
    },
    {
      sku: 'clusters.managed',
      name: 'Clusters',
      unit: 'clusters',
      kind: 'limit',
      source: 'snapshot',
      aggregate: 'peak',
      total: 2,
      points: [],
    },
    {
      sku: 'build.minutes',
      name: 'Build minutes',
      unit: 'minutes',
      kind: 'meter',
      source: 'deployments',
      aggregate: 'sum',
      total: 50,
      points: [{ period: '2026-11', quantity: 50, by_organization: { 'org-a': 30, 'org-b': 20 } }],
    },
  ],
}

it('requests monthly history, focuses on the current organization and keeps separate minute metrics without resource counts or daily rows', async () => {
  const usageHistory = jest.fn().mockResolvedValue(history)
  const client = {
    mode: 'live',
    publicPlans: jest.fn(),
    billingUsage: jest.fn(),
    spendLimits: jest.fn(),
    usageHistory,
  } satisfies PricingClient
  const { userEvent } = renderWithProviders(
    <UsageHistory organizationId="org-a" client={client} today={new Date('2026-11-27')} />
  )
  expect(await screen.findByText('Build + deploy minutes: 60 minutes')).toBeInTheDocument()
  expect(usageHistory).toHaveBeenCalledWith('org-a', expect.objectContaining({ granularity: 'month' }))
  expect(screen.queryByRole('option', { name: 'Clusters' })).not.toBeInTheDocument()
  expect(screen.getByRole('option', { name: 'Build minutes' })).toBeInTheDocument()
  expect(screen.queryByRole('table')).not.toBeInTheDocument()
  await userEvent.selectOptions(
    screen.getByRole('combobox', { name: 'Organization' }),
    screen.getByRole('option', { name: 'All organizations' })
  )
  expect(screen.getByText('Build + deploy minutes: 100 minutes')).toBeInTheDocument()
  await userEvent.selectOptions(
    screen.getByRole('combobox', { name: 'Metric' }),
    screen.getByRole('option', { name: 'Build minutes' })
  )
  expect(screen.getByText('Build minutes: 50 minutes')).toBeInTheDocument()
})

it('uses one period selector for history and the build breakdown', async () => {
  const usageHistory = jest.fn().mockResolvedValue(history)
  const buildUsage = jest.fn().mockReturnValue(new Promise(() => undefined))
  const client = {
    mode: 'live',
    publicPlans: jest.fn(),
    billingUsage: jest.fn(),
    spendLimits: jest.fn(),
    usageHistory,
    buildUsage,
  } satisfies PricingClient
  const { userEvent } = renderWithProviders(
    <UsageHistory
      organizationId="org-a"
      client={client}
      today={new Date('2026-11-27')}
      renderDetails={(range) => (
        <BuildUsage organizationId="org-a" client={client} view="summary" periodRange={range} />
      )}
    />
  )
  await screen.findByText('Build + deploy minutes: 60 minutes')
  expect(screen.getAllByRole('combobox', { name: 'Period' })).toHaveLength(1)
  await userEvent.selectOptions(
    screen.getByRole('combobox', { name: 'Period' }),
    screen.getByRole('option', { name: 'Last month' })
  )
  expect(usageHistory).toHaveBeenLastCalledWith('org-a', { from: '2026-10-01', to: '2026-10-31', granularity: 'month' })
  expect(buildUsage).toHaveBeenLastCalledWith('org-a', { from: '2026-10-01', to: '2026-10-31', granularity: 'month' })
})
