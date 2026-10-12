import { QueryClient } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { StrictMode, useEffect, useMemo } from 'react'
import { createQueryGracePeriod } from './create-query-grace-period'

describe('query grace period lifecycle', () => {
  let client: QueryClient
  const queryKey = ['display', 'org', 'cluster']
  function useConnection() {
    const connection = useMemo(
      () =>
        createQueryGracePeriod(client, queryKey, {
          timeoutMs: 90_000,
          initialTimeoutMs: 3_000,
          unavailableValue: 'unavailable',
        }),
      []
    )
    useEffect(() => connection.subscribe(), [connection])
    return connection
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
      first.result.current.received('running')
      first.result.current.disconnected()
      jest.advanceTimersByTime(40_000)
    })
    first.unmount()
    const second = renderHook(useConnection, { wrapper: StrictMode })
    act(() => jest.advanceTimersByTime(49_999))
    expect(client.getQueryData(queryKey)).toBe('running')
    act(() => jest.advanceTimersByTime(1))
    expect(client.getQueryData(queryKey)).toBe('unavailable')
    second.unmount()
    client.clear()
    act(() => jest.advanceTimersByTime(90_000))
    expect(client.getQueryCache().getAll()).toHaveLength(0)
  })

  it('bounds initial loading after eviction with an existing consumer still mounted', () => {
    const first = renderHook(useConnection, { wrapper: StrictMode })
    act(() => {
      first.result.current.received('running')
      first.result.current.disconnected()
      jest.advanceTimersByTime(10_000)
      client.removeQueries({ queryKey, exact: true })
    })
    const second = renderHook(useConnection, { wrapper: StrictMode })
    act(() => jest.advanceTimersByTime(3_000))
    expect(client.getQueryData(queryKey)).toBe('unavailable')
    first.unmount()
    second.unmount()
  })
})
