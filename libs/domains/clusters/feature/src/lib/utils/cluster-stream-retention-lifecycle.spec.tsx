import { QueryClient } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { type ClusterStatusDto } from 'qovery-ws-typescript-axios'
import { StrictMode, useEffect } from 'react'
import { queries } from '@qovery/state/util-queries'
import { scheduleClusterStreamExpiry, setClusterStreamData, subscribeToClusterStream } from './cluster-stream-retention'

const running = { computed_status: { global_status: 'RUNNING' } } as ClusterStatusDto

describe('query grace period lifecycle', () => {
  let client: QueryClient
  const queryKey = queries.clusters.runningStatus({ organizationId: 'org', clusterId: 'cluster' }).queryKey
  function useConnection() {
    useEffect(() => subscribeToClusterStream(client, queryKey), [])
    return {
      received: () => setClusterStreamData(client, queryKey, running),
      disconnected: () => scheduleClusterStreamExpiry(client, queryKey),
    }
  }
  beforeEach(() => {
    jest.useFakeTimers()
    client = new QueryClient()
  })
  afterEach(() => {
    client.clear()
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('balances Strict Mode setup/cleanup and keeps the original deadline on remount', () => {
    const first = renderHook(useConnection, { wrapper: StrictMode })
    act(() => {
      first.result.current.received()
      first.result.current.disconnected()
      jest.advanceTimersByTime(40_000)
    })
    first.unmount()
    const second = renderHook(useConnection, { wrapper: StrictMode })
    act(() => jest.advanceTimersByTime(49_999))
    expect(client.getQueryData(queryKey)).toEqual(running)
    act(() => jest.advanceTimersByTime(1))
    expect(client.getQueryData(queryKey)).toBeNull()
    second.unmount()
    client.clear()
    act(() => jest.advanceTimersByTime(90_000))
    expect(client.getQueryCache().getAll()).toHaveLength(0)
  })

  it('bounds initial loading after eviction with an existing consumer still mounted', () => {
    const first = renderHook(useConnection, { wrapper: StrictMode })
    act(() => {
      first.result.current.received()
      first.result.current.disconnected()
      jest.advanceTimersByTime(10_000)
      client.removeQueries({ queryKey, exact: true })
    })
    const second = renderHook(useConnection, { wrapper: StrictMode })
    act(() => jest.advanceTimersByTime(3_000))
    expect(client.getQueryData(queryKey)).toBeNull()
    first.unmount()
    second.unmount()
  })
})
