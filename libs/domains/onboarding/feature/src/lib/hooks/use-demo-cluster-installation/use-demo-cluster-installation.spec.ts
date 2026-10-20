import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type Cluster, type ClusterStatus, ClustersApi } from 'qovery-typescript-axios'
import { type PropsWithChildren, createElement } from 'react'
import { act, renderHook, waitFor } from '@qovery/shared/util-tests'
import { useDemoClusterInstallation } from './use-demo-cluster-installation'

let queryClient: QueryClient
let listClusters: jest.SpyInstance
let listStatuses: jest.SpyInstance

function clustersResponse(clusters: Partial<Cluster>[]) {
  return { data: { results: clusters } }
}
function statusesResponse(statuses: Partial<ClusterStatus>[]) {
  return { data: { results: statuses } }
}
function renderInstallation(organizationId = 'org-id') {
  return renderHook(() => useDemoClusterInstallation({ organizationId }), {
    wrapper: ({ children }: PropsWithChildren) => createElement(QueryClientProvider, { client: queryClient }, children),
  })
}

beforeEach(() => {
  jest.useFakeTimers()
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  listClusters = jest
    .spyOn(ClustersApi.prototype, 'listOrganizationCluster')
    .mockResolvedValue(clustersResponse([]) as Awaited<ReturnType<ClustersApi['listOrganizationCluster']>>)
  listStatuses = jest
    .spyOn(ClustersApi.prototype, 'getOrganizationClusterStatus')
    .mockResolvedValue(statusesResponse([]) as Awaited<ReturnType<ClustersApi['getOrganizationClusterStatus']>>)
})
afterEach(() => {
  queryClient.clear()
  jest.restoreAllMocks()
  jest.useRealTimers()
})

it.each([
  [false, 'DEPLOYED', true, 'cluster-id', 'DEPLOYED', false],
  [true, 'READY', true, 'cluster-id', 'DEPLOYED', false],
  [true, 'DEPLOYING', true, 'cluster-id', 'DEPLOYED', false],
  [true, 'DEPLOYMENT_ERROR', true, 'cluster-id', 'DEPLOYED', false],
  [true, 'DEPLOYED', false, 'cluster-id', 'DEPLOYED', false],
  [true, 'DEPLOYED', true, 'other-cluster', 'DEPLOYED', false],
  [true, 'DEPLOYED', true, 'cluster-id', 'DEPLOYING', false],
  [true, 'DEPLOYED', true, 'cluster-id', 'DEPLOYED', true],
])(
  'checks demo=%s, state=%s, installed=%s, status cluster=%s, deployment=%s',
  async (isDemo, status, isDeployed, clusterId, deploymentStatus, ready) => {
    listClusters.mockResolvedValue(
      clustersResponse([{ id: 'cluster-id', is_demo: isDemo, status: status as Cluster['status'] }])
    )
    listStatuses.mockResolvedValue(
      statusesResponse([
        { cluster_id: clusterId, status: deploymentStatus as ClusterStatus['status'], is_deployed: isDeployed },
      ])
    )
    const { result } = renderInstallation()
    await waitFor(() => expect(listStatuses).toHaveBeenCalledTimes(1))
    await act(async () => {
      await jest.advanceTimersByTimeAsync(100)
    })
    expect(Boolean(result.current.readyCluster)).toBe(ready)
  }
)

it('polls both endpoints until installation is confirmed, then stops both intervals', async () => {
  listClusters.mockResolvedValue(clustersResponse([{ id: 'cluster-id', is_demo: true, status: 'DEPLOYED' }]))
  listStatuses.mockResolvedValue(
    statusesResponse([{ cluster_id: 'cluster-id', status: 'DEPLOYED', is_deployed: false }])
  )
  const { result } = renderInstallation()
  await act(async () => {
    await jest.advanceTimersByTimeAsync(100)
  })
  expect(result.current.readyCluster).toBeUndefined()
  listStatuses.mockResolvedValue(
    statusesResponse([{ cluster_id: 'cluster-id', status: 'DEPLOYED', is_deployed: true }])
  )
  await act(async () => {
    await jest.advanceTimersByTimeAsync(5000)
  })
  expect(result.current.readyCluster?.id).toBe('cluster-id')
  const clusterCalls = listClusters.mock.calls.length
  const statusCalls = listStatuses.mock.calls.length
  await act(async () => {
    await jest.advanceTimersByTimeAsync(15000)
  })
  expect(listClusters).toHaveBeenCalledTimes(clusterCalls)
  expect(listStatuses).toHaveBeenCalledTimes(statusCalls)
})

it.each(['clusters', 'statuses'])('reports an error from %s and keeps polling', async (endpoint) => {
  const failedQuery = endpoint === 'clusters' ? listClusters : listStatuses
  failedQuery.mockRejectedValue(new Error('Installation check failed'))
  const { result } = renderInstallation()
  await act(async () => {
    await jest.advanceTimersByTimeAsync(100)
  })
  expect(result.current.isError).toBe(true)
  expect(result.current.readyCluster).toBeUndefined()
  await act(async () => {
    await jest.advanceTimersByTimeAsync(5000)
  })
  expect(failedQuery).toHaveBeenCalledTimes(2)
})

it('does not poll without an organization', async () => {
  renderInstallation('')
  await act(async () => {
    await jest.advanceTimersByTimeAsync(10000)
  })
  expect(listClusters).not.toHaveBeenCalled()
  expect(listStatuses).not.toHaveBeenCalled()
})
