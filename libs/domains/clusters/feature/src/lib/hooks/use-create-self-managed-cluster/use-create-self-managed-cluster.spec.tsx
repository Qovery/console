import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import { type SelfManagedClusterRequest } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { act, renderHook } from '@qovery/shared/util-tests'
import { useCreateSelfManagedCluster } from './use-create-self-managed-cluster'

// The generated client dispatches every call through `axios.request`
const mockAxiosRequest = jest.spyOn(axios, 'request')

const selfManagedClusterRequest: SelfManagedClusterRequest = {
  name: 'customer-eu',
  production: false,
  provider: 'AWS',
  region: 'eu-west-3',
  credentials: { id: 'credential-123' },
  platform: { templateKey: 'qovery-cluster-v0', templateVersion: '0.1.0', layerSelections: {}, managedConfig: {} },
  clusterInputs: {},
}

describe('useCreateSelfManagedCluster', () => {
  beforeEach(() => {
    mockAxiosRequest.mockResolvedValue({ data: { id: 'cluster-123', name: 'customer-eu', provider: 'AWS' } })
  })

  it('creates the cluster with its credential and platform configuration in one call', async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    const { result } = renderHook(() => useCreateSelfManagedCluster(), {
      wrapper: ({ children }: PropsWithChildren) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    })

    await act(async () => {
      await result.current.mutateAsync({ organizationId: 'org-123', selfManagedClusterRequest })
    })

    expect(mockAxiosRequest).toHaveBeenCalledTimes(1)
    expect(mockAxiosRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: expect.stringContaining('/v1/organization/org-123/selfManagedCluster'),
        data: JSON.stringify(selfManagedClusterRequest),
      })
    )
  })
})
