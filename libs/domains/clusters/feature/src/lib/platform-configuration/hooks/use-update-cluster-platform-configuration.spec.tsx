import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ClusterPlatformConfigurationRequest, PlatformConfigurationApi } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { toastError } from '@qovery/shared/ui'
import { act, renderHook } from '@qovery/shared/util-tests'
import { queries } from '@qovery/state/util-queries'
import { useUpdateClusterPlatformConfiguration } from './use-update-cluster-platform-configuration'

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  toastError: jest.fn(),
}))

const request: ClusterPlatformConfigurationRequest = {
  platform: { templateKey: 'qovery-cluster-v0', templateVersion: '0.1.0', layerSelections: {}, managedConfig: {} },
  clusterInputs: {},
}

async function saveConfiguration(queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })) {
  const { result } = renderHook(() => useUpdateClusterPlatformConfiguration(), {
    wrapper: ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  await act(async () => {
    await result.current.mutateAsync({ clusterId: 'cluster-123', request }).catch(() => undefined)
  })
}

describe('useUpdateClusterPlatformConfiguration', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('caches the saved configuration and refreshes its previews and Operator bootstrap', async () => {
    const configuration = { clusterId: 'cluster-123', organizationId: 'org-123', ...request, layers: [] }
    jest
      .spyOn(PlatformConfigurationApi.prototype, 'updateClusterPlatformConfiguration')
      .mockResolvedValue({ data: configuration } as never)
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries')

    await saveConfiguration(queryClient)

    expect(
      queryClient.getQueryData(
        queries.platformConfiguration.clusterConfiguration({ clusterId: 'cluster-123' }).queryKey
      )
    ).toEqual(configuration)
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queries.platformConfiguration.componentConfiguration._def,
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queries.clusterOperator.bootstrap({ organizationId: 'org-123', clusterId: 'cluster-123' }).queryKey,
    })
    expect(toastError).not.toHaveBeenCalled()
  })

  it('explains that the configuration of a cluster using a profile it does not own cannot be saved', async () => {
    const error = { response: { status: 409 } }
    jest.spyOn(PlatformConfigurationApi.prototype, 'updateClusterPlatformConfiguration').mockRejectedValue(error)

    await saveConfiguration()

    expect(toastError).toHaveBeenCalledWith(
      error,
      'Platform configuration not saved',
      'This cluster uses a platform profile it does not own, so its configuration cannot be changed from this cluster.'
    )
  })

  it('shows other save errors as returned by the API', async () => {
    const error = { response: { status: 400 }, message: 'Invalid layer selections' }
    jest.spyOn(PlatformConfigurationApi.prototype, 'updateClusterPlatformConfiguration').mockRejectedValue(error)

    await saveConfiguration()

    expect(toastError).toHaveBeenCalledWith(error)
  })
})
