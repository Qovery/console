import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { type PropsWithChildren } from 'react'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { useClusterRunningStatusSocket } from './use-cluster-running-status-socket'

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

describe('useClusterRunningStatusSocket', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should keep websocket callbacks stable across rerenders for the same cluster scope', () => {
    const queryClient = new QueryClient()
    const wrapper = createWrapper(queryClient)

    const { rerender } = renderHook(
      ({ organizationId, clusterId }) => useClusterRunningStatusSocket({ organizationId, clusterId }),
      {
        initialProps: { organizationId: 'org-1', clusterId: 'cluster-1' },
        wrapper,
      }
    )

    const firstSubscriptionConfig = mockUseReactQueryWsSubscription.mock.calls[0][0]

    rerender({ organizationId: 'org-1', clusterId: 'cluster-1' })

    const secondSubscriptionConfig = mockUseReactQueryWsSubscription.mock.calls[1][0]

    expect(secondSubscriptionConfig.onMessage).toBe(firstSubscriptionConfig.onMessage)
    expect(secondSubscriptionConfig.onClose).toBe(firstSubscriptionConfig.onClose)
  })
})
