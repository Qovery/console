import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { type ClusterMetricsDto } from 'qovery-ws-typescript-axios'
import { type PropsWithChildren } from 'react'
import { queries, useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { useClusterMetricsSocket } from './use-cluster-metrics-socket'

jest.mock('@qovery/state/util-queries', () => ({
  ...jest.requireActual('@qovery/state/util-queries'),
  useReactQueryWsSubscription: jest.fn(),
}))

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({ getAccessTokenSilently: () => Promise.reject({ error: 'login_required' }) }),
}))

const identity = { organizationId: 'org', clusterId: 'cluster' }
const metrics = {
  nodes: [{ name: 'worker', instance_type: 't3.medium' }, { name: 'fargate' }],
} as ClusterMetricsDto
const filtered = { nodes: [metrics.nodes[0]] }

describe('cluster metrics connection grace period', () => {
  let client: QueryClient
  const displayed = () => client.getQueryData(queries.clusters.metrics(identity).queryKey)
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  const subscription = () => {
    const calls = jest.mocked(useReactQueryWsSubscription).mock.calls
    return calls[calls.length - 1][0]
  }

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

  it('retains filtered metrics during a short interruption and recovers without clearing them', () => {
    const { unmount } = renderHook(() => useClusterMetricsSocket(identity), { wrapper })
    expect(subscription().shouldReconnect).toBe(true)
    act(() => {
      subscription().onMessage?.(client, metrics)
      subscription().onDisconnect?.(client, new CloseEvent('close', { reason: 'NotFound' }))
      jest.advanceTimersByTime(60_000)
    })
    expect(displayed()).toEqual(filtered)
    act(() => subscription().onMessage?.(client, metrics))
    act(() => jest.advanceTimersByTime(90_000))
    expect(displayed()).toEqual(filtered)
    unmount()
  })

  it('expires after 90 seconds despite retries and route remounts, then accepts fresh metrics', () => {
    const first = renderHook(() => useClusterMetricsSocket(identity), { wrapper })
    act(() => {
      subscription().onMessage?.(client, metrics)
      subscription().onDisconnect?.(client, new CloseEvent('close', { code: 1006 }))
      jest.advanceTimersByTime(45_000)
    })
    first.unmount()
    const second = renderHook(() => useClusterMetricsSocket(identity), { wrapper })
    act(() => {
      subscription().onDisconnect?.(client, new CloseEvent('close', { reason: 'NotFound' }))
      jest.advanceTimersByTime(44_999)
    })
    expect(displayed()).toEqual(filtered)
    act(() => jest.advanceTimersByTime(1))
    expect(displayed()).toBeNull()
    act(() => subscription().onMessage?.(client, metrics))
    expect(displayed()).toEqual(filtered)
    second.unmount()
  })

  it('bounds initial loading without inventing metrics', () => {
    const { unmount } = renderHook(() => useClusterMetricsSocket(identity), { wrapper })
    act(() => jest.advanceTimersByTime(2_999))
    expect(displayed()).toBeUndefined()
    act(() => jest.advanceTimersByTime(1))
    expect(displayed()).toBeNull()
    unmount()
  })
  it('expires retained metrics when authentication fails before a socket can open', async () => {
    client.setQueryData(queries.clusters.metrics(identity).queryKey, filtered)
    jest
      .mocked(useReactQueryWsSubscription)
      .mockImplementation(jest.requireActual('@qovery/state/util-queries').useReactQueryWsSubscription)
    const { unmount } = renderHook(() => useClusterMetricsSocket(identity), { wrapper })
    await act(async () => {
      await Promise.resolve()
    })
    act(() => jest.advanceTimersByTime(89_999))
    expect(displayed()).toEqual(filtered)
    act(() => jest.advanceTimersByTime(1))
    expect(displayed()).toBeNull()
    unmount()
    jest.mocked(useReactQueryWsSubscription).mockReset()
  })
})
