import { QueryClient, type QueryKey } from '@tanstack/react-query'
import { queries } from './queries'

function expectSeparateCacheEntries(firstKey: QueryKey, secondKey: QueryKey) {
  const queryClient = new QueryClient()
  queryClient.setQueryData(firstKey, 'first response')
  queryClient.setQueryData(secondKey, 'second response')

  expect(queryClient.getQueryData(firstKey)).toBe('first response')
  expect(queryClient.getQueryData(secondKey)).toBe('second response')
  queryClient.clear()
}

describe('query cache isolation', () => {
  it('keeps instance types from different cloud regions separate', () => {
    const first = queries.cloudProviders.listInstanceTypes({
      cloudProvider: 'AWS',
      clusterType: 'MANAGED',
      region: 'eu-west-1',
    })
    const second = queries.cloudProviders.listInstanceTypes({
      cloudProvider: 'AWS',
      clusterType: 'MANAGED',
      region: 'us-east-1',
    })

    expectSeparateCacheEntries(first.queryKey, second.queryKey)
  })

  it('keeps service deployment history pages of different sizes separate', () => {
    const first = queries.services.deploymentHistory({ serviceId: 'service', serviceType: 'APPLICATION', pageSize: 10 })
    const second = queries.services.deploymentHistory({
      serviceId: 'service',
      serviceType: 'APPLICATION',
      pageSize: 20,
    })

    expectSeparateCacheEntries(first.queryKey, second.queryKey)
  })

  it('keeps environment deployment history pages of different sizes separate', () => {
    const first = queries.environments.deploymentHistoryV2({ environmentId: 'environment', pageSize: 10 })
    const second = queries.environments.deploymentHistoryV2({ environmentId: 'environment', pageSize: 20 })

    expectSeparateCacheEntries(first.queryKey, second.queryKey)
  })

  it('keeps repository branches from different Git token IDs separate', () => {
    const first = queries.organizations.branches({
      organizationId: 'organization',
      gitProvider: 'GITHUB',
      name: 'repository',
      gitToken: 'token-id-one',
    })
    const second = queries.organizations.branches({
      organizationId: 'organization',
      gitProvider: 'GITHUB',
      name: 'repository',
      gitToken: 'token-id-two',
    })

    expectSeparateCacheEntries(first.queryKey, second.queryKey)
  })

  it('keeps resource labels from different observation periods separate', () => {
    const first = queries.observability.containerName({
      clusterId: 'cluster',
      serviceId: 'service',
      startDate: '2026-10-01T00:00:00Z',
      endDate: '2026-10-01T01:00:00Z',
    })
    const second = queries.observability.containerName({
      clusterId: 'cluster',
      serviceId: 'service',
      startDate: '2026-10-02T00:00:00Z',
      endDate: '2026-10-02T01:00:00Z',
    })

    expectSeparateCacheEntries(first.queryKey, second.queryKey)
  })

  it('keeps identical metric queries from different clusters separate', () => {
    const params = {
      query: 'up',
      maxSourceResolution: '0s',
      boardShortName: 'service_overview',
      metricShortName: 'pod_count',
      traceId: 'trace',
      alignedRange: '0',
    }
    const first = queries.observability.metrics({ ...params, clusterId: 'cluster-one' })
    const second = queries.observability.metrics({ ...params, clusterId: 'cluster-two' })

    expectSeparateCacheEntries(first.queryKey, second.queryKey)
  })
})
