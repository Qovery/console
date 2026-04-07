import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { type ServiceStatusDto } from 'qovery-ws-typescript-axios'
import { type PropsWithChildren } from 'react'
import { queries, useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { useClusterServiceRunningStatusSocket } from './use-cluster-service-running-status-socket'

jest.mock('@qovery/state/util-queries', () => ({
  ...jest.requireActual('@qovery/state/util-queries'),
  useReactQueryWsSubscription: jest.fn(),
}))

const mockUseReactQueryWsSubscription = jest.mocked(useReactQueryWsSubscription)

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const mockServiceStatusMessage: ServiceStatusDto = {
  environments: [
    {
      id: 'env-1',
      project_id: 'project-1',
      state: 'RUNNING',
      applications: [
        {
          id: 'service-1',
          certificates: [],
          pods: [],
          scaled_object: null,
          state: 'ERROR',
        },
      ],
      containers: [],
      databases: [],
      helms: [],
      jobs: [],
      terraform: [],
    },
  ],
}

describe('useClusterServiceRunningStatusSocket', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should keep websocket callbacks stable across rerenders for the same cluster scope', () => {
    const queryClient = new QueryClient()
    const wrapper = createWrapper(queryClient)

    const { rerender } = renderHook(
      ({ organizationId, clusterId, projectId }) =>
        useClusterServiceRunningStatusSocket({ organizationId, clusterId, projectId }),
      {
        initialProps: { organizationId: 'org-1', clusterId: 'cluster-1', projectId: 'project-1' },
        wrapper,
      }
    )

    const firstSubscriptionConfig = mockUseReactQueryWsSubscription.mock.calls[0][0]

    rerender({ organizationId: 'org-1', clusterId: 'cluster-1', projectId: 'project-1' })

    const secondSubscriptionConfig = mockUseReactQueryWsSubscription.mock.calls[1][0]

    expect(secondSubscriptionConfig.onOpen).toBe(firstSubscriptionConfig.onOpen)
    expect(secondSubscriptionConfig.onMessage).toBe(firstSubscriptionConfig.onMessage)
    expect(secondSubscriptionConfig.onClose).toBe(firstSubscriptionConfig.onClose)
  })

  it('should populate running status queries from websocket messages', () => {
    const queryClient = new QueryClient()
    const resetQueriesSpy = jest.spyOn(queryClient, 'resetQueries')

    renderHook(
      () =>
        useClusterServiceRunningStatusSocket({
          organizationId: 'org-1',
          clusterId: 'cluster-1',
          projectId: 'project-1',
        }),
      {
        wrapper: createWrapper(queryClient),
      }
    )

    const subscriptionConfig = mockUseReactQueryWsSubscription.mock.calls[0][0]

    expect(subscriptionConfig.url).toContain('/service/status')
    expect(subscriptionConfig.urlSearchParams).toMatchObject({
      organization: 'org-1',
      cluster: 'cluster-1',
      project: 'project-1',
    })

    subscriptionConfig.onMessage?.(queryClient, mockServiceStatusMessage)

    expect(queryClient.getQueryData(queries.environments.runningStatus('env-1').queryKey)).toEqual({
      state: 'RUNNING',
    })
    expect(queryClient.getQueryData(queries.services.runningStatus('env-1', 'service-1').queryKey)).toMatchObject({
      id: 'service-1',
      state: 'ERROR',
    })
    expect(queryClient.getQueryData(queries.environments.checkRunningStatusClosed('cluster-1').queryKey)).toEqual({
      clusterId: 'cluster-1',
      reason: '',
    })
    expect(resetQueriesSpy).toHaveBeenCalledWith([...queries.services.runningStatus._def, 'env-1'])
  })

  it('should set the cluster running status closed flag on not found close events', () => {
    const queryClient = new QueryClient()

    renderHook(
      () =>
        useClusterServiceRunningStatusSocket({
          organizationId: 'org-1',
          clusterId: 'cluster-1',
          projectId: 'project-1',
        }),
      {
        wrapper: createWrapper(queryClient),
      }
    )

    const subscriptionConfig = mockUseReactQueryWsSubscription.mock.calls[0][0]

    subscriptionConfig.onClose?.(queryClient, { reason: 'NotFound: cluster status unavailable' } as CloseEvent)

    expect(queryClient.getQueryData(queries.environments.checkRunningStatusClosed('cluster-1').queryKey)).toEqual({
      clusterId: 'cluster-1',
      reason: 'NotFound: cluster status unavailable',
    })
  })
})
