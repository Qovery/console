import { QueryClient } from '@tanstack/react-query'
import { type ClusterStatusDto } from 'qovery-ws-typescript-axios'
import { queries } from '@qovery/state/util-queries'
import { clusterStatusGracePeriod } from './cluster-status-grace-period'

const running = { computed_status: { global_status: 'RUNNING' } } as ClusterStatusDto
const error = { computed_status: { global_status: 'ERROR' } } as ClusterStatusDto
const warning = { computed_status: { global_status: 'WARNING' } } as ClusterStatusDto

describe('cluster status connection grace period', () => {
  let client: QueryClient
  const queryKey = queries.clusters.runningDisplayStatus({ organizationId: 'org', clusterId: 'cluster' }).queryKey
  const displayed = () => client.getQueryData(queryKey)

  beforeEach(() => {
    jest.useFakeTimers()
    client = new QueryClient()
  })

  afterEach(() => {
    client.clear()
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('waits only 3 seconds on initial connection, then recovers even after expiry', () => {
    const connection = clusterStatusGracePeriod(client, 'org', 'cluster')
    connection.subscribe()
    jest.advanceTimersByTime(2_999)
    expect(displayed()).toBeUndefined()
    jest.advanceTimersByTime(1)
    expect(displayed()).toBe('NotFound')
    connection.received(running)
    expect(displayed()).toEqual(running)
  })

  it('retains the known status for a short interruption and cancels expiry on recovery', () => {
    const connection = clusterStatusGracePeriod(client, 'org', 'cluster')
    connection.subscribe()
    connection.received(running)
    connection.disconnected()
    jest.advanceTimersByTime(60_000)
    expect(displayed()).toEqual(running)
    connection.received(running)
    jest.advanceTimersByTime(90_000)
    expect(displayed()).toEqual(running)
  })

  it('does not extend the deadline on retries or navigation', () => {
    const connection = clusterStatusGracePeriod(client, 'org', 'cluster')
    const unsubscribe = connection.subscribe()
    connection.received(running)
    connection.disconnected()
    jest.advanceTimersByTime(40_000)
    connection.disconnected()
    unsubscribe()
    const nextPage = clusterStatusGracePeriod(client, 'org', 'cluster')
    nextPage.subscribe()
    jest.advanceTimersByTime(49_999)
    expect(displayed()).toEqual(running)
    jest.advanceTimersByTime(1)
    expect(displayed()).toBe('NotFound')
  })

  it.each([warning, error])('immediately displays a fresh health issue', (status) => {
    const connection = clusterStatusGracePeriod(client, 'org', 'cluster')
    connection.subscribe()
    connection.received(running)
    connection.disconnected()
    connection.received(status)
    expect(displayed()).toEqual(status)
    jest.advanceTimersByTime(90_000)
    expect(displayed()).toEqual(status)
  })

  it('shares recovery across concurrent consumers without affecting raw status', () => {
    const connection = clusterStatusGracePeriod(client, 'org', 'cluster')
    const unsubscribe = connection.subscribe()
    connection.received(running)
    const second = clusterStatusGracePeriod(client, 'org', 'cluster')
    second.subscribe()
    connection.disconnected()
    second.received(warning)
    unsubscribe()
    jest.advanceTimersByTime(90_000)
    expect(displayed()).toEqual(warning)
    expect(
      client.getQueryData(queries.clusters.runningStatus({ organizationId: 'org', clusterId: 'cluster' }).queryKey)
    ).toBeUndefined()
  })

  it('cancels timers on cache clear without recreating queries', () => {
    const connection = clusterStatusGracePeriod(client, 'org', 'cluster')
    const unsubscribe = connection.subscribe()
    connection.received(running)
    connection.disconnected()
    jest.advanceTimersByTime(10_000)
    client.clear()
    unsubscribe()
    jest.advanceTimersByTime(90_000)
    expect(client.getQueryCache().getAll()).toHaveLength(0)
  })

  it('uses the initial timeout after eviction and remount instead of the old deadline', () => {
    const connection = clusterStatusGracePeriod(client, 'org', 'cluster')
    const unsubscribe = connection.subscribe()
    connection.received(running)
    connection.disconnected()
    jest.advanceTimersByTime(10_000)
    client.removeQueries({ queryKey, exact: true })
    unsubscribe()
    const next = clusterStatusGracePeriod(client, 'org', 'cluster')
    next.subscribe()
    jest.advanceTimersByTime(2_999)
    expect(displayed()).toBeUndefined()
    jest.advanceTimersByTime(1)
    expect(displayed()).toBe('NotFound')
    next.received(running)
    jest.advanceTimersByTime(90_000)
    expect(displayed()).toEqual(running)
  })

  it('does not register queries or timers for an abandoned render', () => {
    clusterStatusGracePeriod(client, 'org', 'cluster')
    expect(client.getQueryCache().getAll()).toHaveLength(0)
    expect(jest.getTimerCount()).toBe(0)
  })

  it('isolates clusters and gives a new interruption its own deadline', () => {
    const connection = clusterStatusGracePeriod(client, 'org', 'cluster')
    connection.subscribe()
    connection.received(running)
    const other = clusterStatusGracePeriod(client, 'other-org', 'cluster')
    other.subscribe()
    jest.advanceTimersByTime(90_000)
    expect(displayed()).toEqual(running)
    connection.disconnected()
    jest.advanceTimersByTime(90_000)
    expect(displayed()).toBe('NotFound')
    connection.received(running)
    connection.disconnected()
    jest.advanceTimersByTime(89_999)
    expect(displayed()).toEqual(running)
    jest.advanceTimersByTime(1)
    expect(displayed()).toBe('NotFound')
  })
})
