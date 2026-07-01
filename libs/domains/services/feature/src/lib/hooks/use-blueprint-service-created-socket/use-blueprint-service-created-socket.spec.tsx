import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { type PropsWithChildren } from 'react'
import { queries, useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { useBlueprintServiceCreatedSocket } from './use-blueprint-service-created-socket'

jest.mock('@qovery/shared/util-node-env', () => ({
  QOVERY_WS: 'wss://ws.qovery.com',
}))

jest.mock('@qovery/state/util-queries', () => ({
  ...jest.requireActual('@qovery/state/util-queries'),
  useReactQueryWsSubscription: jest.fn(),
}))

const useReactQueryWsSubscriptionMock = jest.mocked(useReactQueryWsSubscription)

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function renderUseBlueprintServiceCreatedSocket(
  props: Parameters<typeof useBlueprintServiceCreatedSocket>[0],
  queryClient = new QueryClient()
) {
  renderHook(() => useBlueprintServiceCreatedSocket(props), {
    wrapper: createWrapper(queryClient),
  })

  return queryClient
}

describe('useBlueprintServiceCreatedSocket', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should subscribe to the blueprint service-created endpoint with route params', () => {
    renderUseBlueprintServiceCreatedSocket({
      organizationId: 'org-1',
      projectId: 'proj-1',
      environmentId: 'env-1',
    })

    expect(useReactQueryWsSubscriptionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'wss://ws.qovery.com/blueprint/service-created',
        urlSearchParams: {
          organization: 'org-1',
          project: 'proj-1',
          environment: 'env-1',
        },
        enabled: true,
      })
    )
  })

  it('should not subscribe until all params are available', () => {
    renderUseBlueprintServiceCreatedSocket({
      organizationId: 'org-1',
      projectId: 'proj-1',
      enabled: true,
    })

    expect(useReactQueryWsSubscriptionMock).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
  })

  it('should invalidate the environment service list when the service-created event is received', () => {
    const queryClient = renderUseBlueprintServiceCreatedSocket({
      organizationId: 'org-1',
      projectId: 'proj-1',
      environmentId: 'env-1',
    })
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries')
    const subscriptionConfig = useReactQueryWsSubscriptionMock.mock.calls[0]?.[0]

    subscriptionConfig?.onMessage?.(queryClient, {})

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queries.services.list('env-1').queryKey,
    })
  })

  it('should notify the caller when a query invalidation event is processed', () => {
    const onServiceCreated = jest.fn()
    const queryClient = renderUseBlueprintServiceCreatedSocket({
      organizationId: 'org-1',
      projectId: 'proj-1',
      environmentId: 'env-1',
      onServiceCreated,
    })
    const subscriptionConfig = useReactQueryWsSubscriptionMock.mock.calls[0]?.[0]

    subscriptionConfig?.onQueryInvalidated?.(queryClient, { entity: ['services'], id: 'service-1' })

    expect(onServiceCreated).toHaveBeenCalledTimes(1)
  })
})
