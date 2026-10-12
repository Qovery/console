import { type Query, type QueryClient, type QueryKey, hashQueryKey } from '@tanstack/react-query'

interface ConnectionState {
  subscribers: number
  deadline?: number
  timer?: ReturnType<typeof setTimeout>
  query?: Query
  unsubscribe: () => void
  schedule: () => void
}

const connections = new WeakMap<QueryClient, Map<string, ConnectionState>>()

// Multiple sockets may share a query: the first disconnect owns the deadline;
// any fresh payload cancels it. Repeated disconnects never extend it.
// Creating a handle is pure. Registration happens only when an effect subscribes.
export function createQueryGracePeriod<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  {
    timeoutMs,
    initialTimeoutMs,
    unavailableValue,
  }: { timeoutMs: number; initialTimeoutMs: number; unavailableValue: T }
) {
  const key = hashQueryKey(queryKey)
  const cache = queryClient.getQueryCache()
  const current = () => connections.get(queryClient)?.get(key)

  function register() {
    const existing = current()
    if (existing) return existing
    let states = connections.get(queryClient)
    if (!states) {
      states = new Map()
      connections.set(queryClient, states)
    }
    const registry = states
    const connection: ConnectionState = {
      subscribers: 0,
      query: cache.find(queryKey, { exact: true }),
      unsubscribe: () => undefined,
      schedule() {
        if (connection.timer !== undefined || !connection.query) return
        const expectedQuery = connection.query
        const previous = expectedQuery.state.data
        const hasKnownValue = previous !== undefined && previous !== unavailableValue
        connection.deadline ??= Date.now() + (hasKnownValue ? timeoutMs : initialTimeoutMs)
        connection.timer = setTimeout(
          () => {
            connection.timer = undefined
            connection.deadline = undefined
            // A removed/replaced query must never be resurrected by an old timer.
            if (cache.find(queryKey, { exact: true }) === expectedQuery) {
              queryClient.setQueryData(queryKey, unavailableValue)
            }
            if (connection.subscribers === 0) {
              connection.unsubscribe()
              registry.delete(key)
            }
          },
          Math.max(0, connection.deadline - Date.now())
        )
      },
    }
    registry.set(key, connection)
    connection.unsubscribe = cache.subscribe((event) => {
      if (event.query.queryHash !== key) return
      if (event.type === 'removed' && event.query === connection.query) {
        clearTimeout(connection.timer)
        connection.timer = undefined
        connection.deadline = undefined
        connection.query = undefined
        if (connection.subscribers === 0) {
          connection.unsubscribe()
          registry.delete(key)
        }
      } else if (event.type === 'added') {
        connection.query = event.query
        connection.schedule()
      }
    })
    return connection
  }

  return {
    subscribe() {
      const connection = register()
      connection.subscribers++
      // Register an empty initial query so cache.clear/removeQueries also cancels
      // initial-loading timers. Merely constructing this handle creates nothing.
      connection.query = cache.build(queryClient, { queryKey })
      if (connection.subscribers === 1) connection.schedule()
      let active = true
      return () => {
        if (!active) return
        active = false
        connection.subscribers--
        if (connection.subscribers === 0) {
          if (connection.query) connection.schedule()
          else {
            connection.unsubscribe()
            connections.get(queryClient)?.delete(key)
          }
        }
      }
    },
    disconnected() {
      current()?.schedule()
    },
    received(status: T) {
      const connection = current()
      if (!connection) return
      queryClient.setQueryData(queryKey, status)
      clearTimeout(connection.timer)
      connection.timer = undefined
      connection.deadline = undefined
    },
  }
}
