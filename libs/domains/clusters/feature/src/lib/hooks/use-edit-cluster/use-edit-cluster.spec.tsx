import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { type Cluster, type ClusterRequest } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { act, renderHook, waitFor } from '@qovery/shared/util-tests'
import { queries } from '@qovery/state/util-queries'
import { useEditCluster } from './use-edit-cluster'

const organizationId = 'org-123'
const clusterId = 'cluster-123'

const cluster = {
  id: clusterId,
  name: 'my-cluster',
  region: 'eu-west-3',
  cloud_provider: 'AWS',
  wide_permissions: { using_restrictive_permissions: false },
} as Cluster
const otherCluster = { ...cluster, id: 'other-cluster' } as Cluster

const setup = (editedCluster: Cluster) => {
  const requestSpy = jest.spyOn(axios, 'request').mockImplementation(async (config) => {
    // Keep refetches pending to observe the cache before they complete
    if (config?.method?.toUpperCase() === 'GET') return new Promise(() => undefined)
    return { data: editedCluster }
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const clustersQuery = queries.clusters.list({ organizationId })
  queryClient.setQueryData(clustersQuery.queryKey, [cluster, otherCluster])
  const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const { result: mutation } = renderHook(() => useEditCluster(), { wrapper })
  const { result: list } = renderHook(() => useQuery(clustersQuery), { wrapper })

  return { requestSpy, queryClient, invalidateSpy, mutation, list, clustersQuery }
}

describe('useEditCluster', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('seeds the edited cluster in the list before the refetch completes', async () => {
    const editedCluster = { ...cluster, wide_permissions: { using_restrictive_permissions: true } } as Cluster
    const { queryClient, invalidateSpy, mutation, list, clustersQuery } = setup(editedCluster)

    await act(async () => {
      await mutation.current.mutateAsync({
        organizationId,
        clusterId,
        clusterRequest: { ...cluster, wide_permissions: { using_restrictive_permissions: true } } as ClusterRequest,
      })
    })

    await waitFor(() => expect(list.current.data).toEqual([editedCluster, otherCluster]))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: clustersQuery.queryKey })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queries.clusters.cloudProviderInfo({ organizationId, clusterId }).queryKey,
    })
    queryClient.clear()
  })

  it('does not refetch the cloud provider info when restrictive permissions are unchanged', async () => {
    const editedCluster = { ...cluster, name: 'renamed-cluster' } as Cluster
    const { queryClient, invalidateSpy, mutation } = setup(editedCluster)

    await act(async () => {
      await mutation.current.mutateAsync({
        organizationId,
        clusterId,
        clusterRequest: { ...cluster, name: 'renamed-cluster' } as ClusterRequest,
      })
    })

    expect(invalidateSpy).not.toHaveBeenCalledWith({
      queryKey: queries.clusters.cloudProviderInfo({ organizationId, clusterId }).queryKey,
    })
    queryClient.clear()
  })
})
