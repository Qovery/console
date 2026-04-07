import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { type EnvironmentStatusesWithStages } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { queries, useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { useClusterServiceDeploymentStatusSocket } from './use-cluster-service-deployment-status-socket'

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

const mockDeploymentStatusMessage = {
  environment: {
    id: 'env-1',
    status: 'DEPLOYMENT_ERROR',
  },
  stages: [
    {
      applications: [
        {
          id: 'service-1',
          state: 'DEPLOYMENT_ERROR',
        },
      ],
      containers: [],
      databases: [],
      jobs: [],
      helms: [],
      terraforms: [],
    },
  ],
} as EnvironmentStatusesWithStages

describe('useClusterServiceDeploymentStatusSocket', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should keep websocket callbacks stable across rerenders for the same environment scope', () => {
    const queryClient = new QueryClient()
    const wrapper = createWrapper(queryClient)

    const { rerender } = renderHook(
      ({ organizationId, clusterId, projectId, environmentId }) =>
        useClusterServiceDeploymentStatusSocket({ organizationId, clusterId, projectId, environmentId }),
      {
        initialProps: {
          organizationId: 'org-1',
          clusterId: 'cluster-1',
          projectId: 'project-1',
          environmentId: 'env-1',
        },
        wrapper,
      }
    )

    const firstSubscriptionConfig = mockUseReactQueryWsSubscription.mock.calls[0][0]

    rerender({
      organizationId: 'org-1',
      clusterId: 'cluster-1',
      projectId: 'project-1',
      environmentId: 'env-1',
    })

    const secondSubscriptionConfig = mockUseReactQueryWsSubscription.mock.calls[1][0]

    expect(secondSubscriptionConfig.onMessage).toBe(firstSubscriptionConfig.onMessage)
  })

  it('should populate deployment status queries from websocket messages', () => {
    const queryClient = new QueryClient()

    renderHook(
      () =>
        useClusterServiceDeploymentStatusSocket({
          organizationId: 'org-1',
          clusterId: 'cluster-1',
          projectId: 'project-1',
          environmentId: 'env-1',
        }),
      {
        wrapper: createWrapper(queryClient),
      }
    )

    const subscriptionConfig = mockUseReactQueryWsSubscription.mock.calls[0][0]

    expect(subscriptionConfig.url).toContain('/deployment/status')
    expect(subscriptionConfig.urlSearchParams).toMatchObject({
      organization: 'org-1',
      cluster: 'cluster-1',
      project: 'project-1',
      environment: 'env-1',
    })

    subscriptionConfig.onMessage?.(queryClient, mockDeploymentStatusMessage)

    expect(queryClient.getQueryData(queries.environments.deploymentStatus('env-1').queryKey)).toEqual({
      id: 'env-1',
      status: 'DEPLOYMENT_ERROR',
    })
    expect(queryClient.getQueryData(queries.services.deploymentStatus('env-1', 'service-1').queryKey)).toMatchObject({
      id: 'service-1',
      state: 'DEPLOYMENT_ERROR',
    })
  })
})
