import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type PropsWithChildren } from 'react'
import { renderHook, waitFor } from '@qovery/shared/util-tests'
import { useAlertRules } from './use-alert-rules'

const mockRules = [
  {
    id: 'cluster-rds-rule',
    source: 'MANAGED',
    tag: 'cpu',
    cluster_id: 'cluster-1',
    target: { target_id: 'cluster-1', target_type: 'CLUSTER', service: null },
    condition: {
      kind: 'CUSTOM',
      promql: 'aws_rds_cpuutilization_average{dimension_DBInstanceIdentifier="z04d06b19-postgresql"} > 80',
    },
  },
  {
    id: 'database-rule',
    source: 'MANAGED',
    tag: 'rds_cpu',
    cluster_id: 'cluster-1',
    target: { target_id: 'db-1', target_type: 'TERRAFORM' },
    condition: { kind: 'BUILT', promql: 'aws_rds_cpuutilization_average{dimension_DBInstanceIdentifier="db-1"}' },
  },
]

const mockFetchAlertRules = jest.fn()

jest.mock('@qovery/domains/observability/data-access', () => ({
  observability: {
    alertRules: ({ organizationId }: { organizationId: string }) => ({
      queryKey: ['alertRules', organizationId],
      queryFn: () => mockFetchAlertRules(),
    }),
  },
}))

describe('useAlertRules', () => {
  beforeEach(() => {
    mockFetchAlertRules.mockResolvedValue(mockRules)
  })

  // The edit route redirects to the alert list when the rule is not in this list,
  // so a cluster-targeted rule cannot be opened from a database page.
  it('keeps only the rules that target the service', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useAlertRules({ organizationId: 'org-1', serviceId: 'db-1' }), { wrapper })

    await waitFor(() => expect(result.current.isFetched).toBe(true))
    expect(result.current.data?.map((rule) => rule.id)).toEqual(['database-rule'])
  })
})
