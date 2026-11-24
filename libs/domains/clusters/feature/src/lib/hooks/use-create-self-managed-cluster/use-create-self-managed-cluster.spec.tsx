import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import { type SelfManagedClusterRequest } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { act, renderHook, waitFor } from '@qovery/shared/util-tests'
import { useCreateSelfManagedCluster } from './use-create-self-managed-cluster'

const clusterRequest: SelfManagedClusterRequest = {
  name: 'my-cluster',
  production: false,
  provider: 'HETZNER',
  region: 'on-premise',
  credentials: { id: 'on-premise-credential-id' },
  platform: {},
  registry: { url: 'https://registry.example.com', credentials: { username: 'robot', password: 's3cret' } },
}

describe('useCreateSelfManagedCluster', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('sends the request as is and forgets it once the flow is closed', async () => {
    const requestSpy = jest.spyOn(axios, 'request').mockResolvedValue({ data: { id: 'cluster-id' } })
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result, unmount } = renderHook(() => useCreateSelfManagedCluster(), { wrapper })

    await act(() => result.current.mutateAsync({ organizationId: 'org-123', clusterRequest }))

    expect(requestSpy).toHaveBeenCalledTimes(1)
    expect(requestSpy.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      url: expect.stringMatching(/\/organization\/org-123\/selfManagedCluster$/),
      data: JSON.stringify(clusterRequest),
    })

    unmount()

    await waitFor(() => expect(queryClient.getMutationCache().getAll()).toHaveLength(0))
  })
})
