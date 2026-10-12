import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { type ClusterStatusDto } from 'qovery-ws-typescript-axios'
import { type PropsWithChildren } from 'react'
import { queries, useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { useClusterRunningStatusSocket } from './use-cluster-running-status-socket'

jest.mock('@qovery/state/util-queries', () => ({
  ...jest.requireActual('@qovery/state/util-queries'),
  useReactQueryWsSubscription: jest.fn(),
}))

const running = { computed_status: { global_status: 'RUNNING' } } as ClusterStatusDto
const identity = { organizationId: 'org', clusterId: 'cluster' }

describe('cluster status subscription', () => {
  let client: QueryClient

  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    client = new QueryClient()
  })

  afterEach(() => {
    client.clear()
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('retains only the display status during NotFound and recovers after the deadline', () => {
    const { unmount } = renderHook(() => useClusterRunningStatusSocket(identity), {
      wrapper: ({ children }: PropsWithChildren) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    })
    const subscription = jest.mocked(useReactQueryWsSubscription).mock.calls[0][0]
    expect(subscription.shouldReconnect).toBe(true)
    expect(subscription.maxReconnectDelay).toBe(10_000)

    act(() => {
      subscription.onMessage?.(client, running)
      subscription.onDisconnect?.(client, new CloseEvent('close', { reason: 'NotFound' }))
    })
    expect(client.getQueryData(queries.clusters.runningStatus(identity).queryKey)).toBe('NotFound')
    expect(client.getQueryData(queries.clusters.runningDisplayStatus(identity).queryKey)).toEqual(running)

    act(() => jest.advanceTimersByTime(90_000))
    expect(client.getQueryData(queries.clusters.runningDisplayStatus(identity).queryKey)).toBe('NotFound')
    act(() => subscription.onMessage?.(client, running))
    expect(client.getQueryData(queries.clusters.runningDisplayStatus(identity).queryKey)).toEqual(running)
    unmount()
  })

  it('bounds initial loading and handles transport closes without a NotFound reason', () => {
    const { unmount } = renderHook(() => useClusterRunningStatusSocket(identity), {
      wrapper: ({ children }: PropsWithChildren) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    })
    const subscription = jest.mocked(useReactQueryWsSubscription).mock.calls[0][0]
    act(() => {
      jest.advanceTimersByTime(1_000)
      subscription.onDisconnect?.(client, new CloseEvent('close', { code: 1006 }))
      jest.advanceTimersByTime(1_999)
    })
    expect(client.getQueryData(queries.clusters.runningDisplayStatus(identity).queryKey)).toBeUndefined()
    act(() => jest.advanceTimersByTime(1))
    expect(client.getQueryData(queries.clusters.runningDisplayStatus(identity).queryKey)).toBe('NotFound')
    unmount()
  })
})
