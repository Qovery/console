import { type Query, type QueryClient, type QueryKey } from '@tanstack/react-query'
import { type ClusterMetricsDto, type ClusterStatusDto } from 'qovery-ws-typescript-axios'

const RETENTION_MS = 90_000
const INITIAL_LOADING_MS = 3_000
// React Query owns the values and query lifetime. Only socket ownership and the
// pending disconnect timeout need sharing between consumers of the same query.
const streams = new WeakMap<Query, { consumers: number; timer?: ReturnType<typeof setTimeout> }>()

function streamState(query: Query) {
  let state = streams.get(query)
  if (!state) {
    state = { consumers: 0 }
    streams.set(query, state)
  }
  return state
}

export function scheduleClusterStreamExpiry(client: QueryClient, key: QueryKey) {
  const query = client.getQueryCache().find(key, { exact: true })
  if (!query || query.state.data === null) return
  const state = streamState(query)
  // Retries and remounts keep the first timeout; they cannot extend it.
  if (state.timer !== undefined) return
  state.timer = setTimeout(
    () => {
      state.timer = undefined
      // A detached timer must not recreate an evicted query or overwrite its replacement.
      if (client.getQueryCache().find(key, { exact: true }) === query) client.setQueryData(key, null)
    },
    query.state.data === undefined ? INITIAL_LOADING_MS : RETENTION_MS
  )
}

export function setClusterStreamData(client: QueryClient, key: QueryKey, data: ClusterStatusDto | ClusterMetricsDto) {
  client.setQueryData(key, data)
  const query = client.getQueryCache().find(key, { exact: true })
  if (!query) return
  const state = streamState(query)
  // A fresh payload from any socket wins over every pending disconnect.
  clearTimeout(state.timer)
  state.timer = undefined
}

export function subscribeToClusterStream(client: QueryClient, key: QueryKey) {
  const cache = client.getQueryCache()
  let query: Query | undefined = cache.build(client, { queryKey: key })
  const hash = query.queryHash
  function acquire(current: Query) {
    query = current
    if (++streamState(current).consumers === 1) scheduleClusterStreamExpiry(client, key)
  }
  acquire(query)
  const unsubscribe = cache.subscribe((event) => {
    if (event.query.queryHash !== hash) return
    if (event.type === 'removed' && event.query === query) {
      const state = streamState(query)
      clearTimeout(state.timer)
      state.timer = undefined
      state.consumers--
      query = undefined
    } else if (event.type === 'added') {
      acquire(event.query)
    }
  })
  return () => {
    unsubscribe()
    // Navigation closes the last socket too. Keep this bounded timer alive so
    // returning to the page cannot restart a full 90-second retention period.
    if (query && --streamState(query).consumers === 0) scheduleClusterStreamExpiry(client, key)
  }
}
