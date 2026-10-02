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

  it('shares HELM chart commits between implicit and explicit chart requests', () => {
    const queryClient = new QueryClient()
    const implicit = queries.services.listCommits({ serviceId: 'helm', serviceType: 'HELM' })
    const explicit = queries.services.listCommits({ serviceType: 'HELM', serviceId: 'helm', of: 'chart' })
    const values = queries.services.listCommits({ serviceId: 'helm', serviceType: 'HELM', of: 'values' })

    queryClient.setQueryData(implicit.queryKey, ['chart commit'])
    queryClient.setQueryData(values.queryKey, ['values commit'])

    expect(queryClient.getQueryData(explicit.queryKey)).toEqual(['chart commit'])
    expect(queryClient.getQueryData(values.queryKey)).toEqual(['values commit'])
    queryClient.clear()
  })

  it('keeps commit lists for different service types separate', () => {
    const application = queries.services.listCommits({ serviceId: 'service', serviceType: 'APPLICATION' })
    const job = queries.services.listCommits({ serviceId: 'service', serviceType: 'JOB' })

    expectSeparateCacheEntries(application.queryKey, job.queryKey)
  })

  it('invalidates every deployment history page for only the requested service and type', async () => {
    const queryClient = new QueryClient()
    const params = { serviceId: 'service', serviceType: 'APPLICATION' as const }
    const histories = [undefined, 10, 100].map((pageSize) =>
      queries.services.deploymentHistory({ ...params, pageSize })
    )
    const otherService = queries.services.deploymentHistory({ ...params, serviceId: 'other', pageSize: 100 })
    const otherType = queries.services.deploymentHistory({ ...params, serviceType: 'JOB', pageSize: 100 })
    for (const history of [...histories, otherService, otherType]) {
      queryClient.setQueryData(history.queryKey, [])
    }

    await queryClient.invalidateQueries({
      queryKey: [...queries.services.deploymentHistory._def, params.serviceId, params.serviceType],
    })

    for (const history of histories) {
      expect(queryClient.getQueryState(history.queryKey)?.isInvalidated).toBe(true)
    }
    expect(queryClient.getQueryState(otherService.queryKey)?.isInvalidated).toBe(false)
    expect(queryClient.getQueryState(otherType.queryKey)?.isInvalidated).toBe(false)
    queryClient.clear()
  })

  it('invalidates every environment deployment history page for only the requested environment', async () => {
    const queryClient = new QueryClient()
    const histories = [undefined, 10, 100].map((pageSize) =>
      queries.environments.deploymentHistoryV2({ environmentId: 'environment', pageSize })
    )
    const otherEnvironment = queries.environments.deploymentHistoryV2({ environmentId: 'other', pageSize: 100 })
    for (const history of [...histories, otherEnvironment]) {
      queryClient.setQueryData(history.queryKey, [])
    }

    await queryClient.invalidateQueries({
      queryKey: [...queries.environments.deploymentHistoryV2._def, 'environment'],
    })

    for (const history of histories) {
      expect(queryClient.getQueryState(history.queryKey)?.isInvalidated).toBe(true)
    }
    expect(queryClient.getQueryState(otherEnvironment.queryKey)?.isInvalidated).toBe(false)
    queryClient.clear()
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
