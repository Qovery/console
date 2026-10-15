import { QueryClient } from '@tanstack/react-query'
import { type ClusterStatusDto } from 'qovery-ws-typescript-axios'
import { queries } from '@qovery/state/util-queries'
import { scheduleClusterStreamExpiry, setClusterStreamData, subscribeToClusterStream } from './cluster-stream-retention'

function connectionFor(client: QueryClient, organizationId: string, clusterId: string) {
  const key = queries.clusters.runningStatus({ organizationId, clusterId }).queryKey
  return {
    subscribe: () => subscribeToClusterStream(client, key),
    disconnected: () => scheduleClusterStreamExpiry(client, key),
    received: (data: ClusterStatusDto) => setClusterStreamData(client, key, data),
  }
}

const running = { computed_status: { global_status: 'RUNNING' } } as ClusterStatusDto
const error = { computed_status: { global_status: 'ERROR' } } as ClusterStatusDto

describe('cluster status connection grace period', () => {
  let client: QueryClient
  const queryKey = queries.clusters.runningStatus({ organizationId: 'org', clusterId: 'cluster' }).queryKey
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

  it('does not extend the deadline on retries or navigation', () => {
    const connection = connectionFor(client, 'org', 'cluster')
    const unsubscribe = connection.subscribe()
    connection.received(running)
    connection.disconnected()
    jest.advanceTimersByTime(40_000)
    connection.disconnected()
    unsubscribe()
    const nextPage = connectionFor(client, 'org', 'cluster')
    nextPage.subscribe()
    jest.advanceTimersByTime(49_999)
    expect(displayed()).toEqual(running)
    jest.advanceTimersByTime(1)
    expect(displayed()).toBeNull()
  })

  it('immediately displays a fresh health issue', () => {
    const connection = connectionFor(client, 'org', 'cluster')
    connection.subscribe()
    connection.received(running)
    connection.disconnected()
    connection.received(error)
    expect(displayed()).toEqual(error)
    jest.advanceTimersByTime(90_000)
    expect(displayed()).toEqual(error)
  })

  it('cancels timers on cache clear without recreating queries', () => {
    const connection = connectionFor(client, 'org', 'cluster')
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
    const connection = connectionFor(client, 'org', 'cluster')
    const unsubscribe = connection.subscribe()
    connection.received(running)
    connection.disconnected()
    jest.advanceTimersByTime(10_000)
    client.removeQueries({ queryKey, exact: true })
    unsubscribe()
    const next = connectionFor(client, 'org', 'cluster')
    next.subscribe()
    jest.advanceTimersByTime(2_999)
    expect(displayed()).toBeUndefined()
    jest.advanceTimersByTime(1)
    expect(displayed()).toBeNull()
    next.received(running)
    jest.advanceTimersByTime(90_000)
    expect(displayed()).toEqual(running)
  })

  it('isolates clusters and gives a new interruption its own deadline', () => {
    const connection = connectionFor(client, 'org', 'cluster')
    connection.subscribe()
    connection.received(running)
    const other = connectionFor(client, 'other-org', 'cluster')
    other.subscribe()
    jest.advanceTimersByTime(90_000)
    expect(displayed()).toEqual(running)
    connection.disconnected()
    jest.advanceTimersByTime(90_000)
    expect(displayed()).toBeNull()
    connection.received(running)
    connection.disconnected()
    jest.advanceTimersByTime(89_999)
    expect(displayed()).toEqual(running)
    jest.advanceTimersByTime(1)
    expect(displayed()).toBeNull()
  })
  it('keeps fresh data when another socket consumer unmounts', () => {
    const first = connectionFor(client, 'org', 'cluster')
    const releaseFirst = first.subscribe()
    const second = connectionFor(client, 'org', 'cluster')
    const releaseSecond = second.subscribe()
    first.disconnected()
    second.received(running)
    releaseFirst()
    jest.advanceTimersByTime(90_000)
    expect(displayed()).toEqual(running)
    releaseSecond()
  })

  it('does not let a detached timer overwrite a replacement query after cache clear', () => {
    const first = connectionFor(client, 'org', 'cluster')
    const release = first.subscribe()
    first.received(running)
    release()
    client.clear()
    const next = connectionFor(client, 'org', 'cluster')
    const releaseNext = next.subscribe()
    next.received(error)
    jest.advanceTimersByTime(90_000)
    expect(displayed()).toEqual(error)
    releaseNext()
  })
})
