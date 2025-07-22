import { useAuth0 } from '@auth0/auth0-react'
import { type QueryClient, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

// Inspired by:
// https://tkdodo.eu/blog/using-web-sockets-with-react-query

export interface UseReactQueryWsSubscriptionProps {
  /** WebSocket origin and pathname */
  url: string
  /** WebSocket searchParams is an object converted to URLSearchParams. Note `bearer_token` is already handled by this hook */
  urlSearchParams?: string[][] | Record<string, string | undefined> | string | URLSearchParams
  /** WebSocket onmessage will be automatically handled if they are aligned with the expected format (https://tkdodo.eu/blog/using-web-sockets-with-react-query#consuming-data) otherwise you should provide an handler */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMessage?: (queryClient: QueryClient, data: any) => void
  onOpen?: (queryClient: QueryClient, event: Event) => void
  onError?: (queryClient: QueryClient, event: Event) => void
  onClose?: (QueryClient: QueryClient, event: CloseEvent) => void
  enabled?: boolean
  /* `boolean` to enable or disable reconnection or `number` to set the maximum number of attempts */
  shouldReconnect?: boolean | number
}

interface InvalidateOperation {
  entity: string[]
  id?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isInvalidateOperation(data: any): data is InvalidateOperation {
  return Array.isArray(data?.entity)
}

// TODO: Add better naming for the hook we can use it without ReactQuery
export function useReactQueryWsSubscription({
  url,
  urlSearchParams,
  onMessage,
  onOpen,
  onError,
  onClose,
  enabled = true,
  shouldReconnect = false,
}: UseReactQueryWsSubscriptionProps) {
  const queryClient = useQueryClient()
  const { getAccessTokenSilently } = useAuth0()

  const MAX_RECONNECT_ATTEMPTS = typeof shouldReconnect === 'number' ? shouldReconnect : Infinity
  const shouldReconnectRef = useRef(shouldReconnect)

  let _urlSearchParams: string[][] | Record<string, string> | string | URLSearchParams

  if (urlSearchParams && !Array.isArray(urlSearchParams) && typeof urlSearchParams != 'string') {
    let entries
    if (urlSearchParams instanceof URLSearchParams) {
      entries = [...urlSearchParams.entries()]
    } else {
      entries = Object.entries(urlSearchParams)
    }
    _urlSearchParams = Object.fromEntries(entries.filter((e): e is [string, string] => Boolean(e[1])))
  } else {
    _urlSearchParams = urlSearchParams ?? ''
  }

  const searchParams = new URLSearchParams(_urlSearchParams)
  const reconnectCount = useRef<number>(0)
  const searchParamsString = searchParams.toString()

  useEffect(() => {
    if (!enabled) {
      return
    }
    let timeout: ReturnType<typeof setTimeout> | undefined
    const controller = new AbortController()

    async function connect({ signal }: { signal: AbortSignal }) {
      const token = await getAccessTokenSilently()
      if (signal.aborted) {
        // signal already aborted do nothing
        return
      }
      const websocket = new WebSocket(`${url}?${searchParamsString}`, ['v1', 'auth.bearer.' + token])

      websocket.onopen = async (event) => {
        onOpen?.(queryClient, event)
      }
      websocket.onmessage = async (event) => {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data

        if (isInvalidateOperation(data)) {
          const queryKey = [...data.entity, data.id].filter(Boolean)
          queryClient.invalidateQueries({ queryKey })
        } else {
          // XXX: Don't know how to handle it, let the caller handle it
          onMessage?.(queryClient, data)
        }
      }
      websocket.onerror = async (event) => {
        onError?.(queryClient, event)
      }
      websocket.onclose = async (event) => {
        if (shouldReconnectRef.current && reconnectCount.current < MAX_RECONNECT_ATTEMPTS) {
          timeout = setTimeout(
            function () {
              reconnectCount.current++
              connect({ signal })
            },
            // Exponential Backoff
            // attemptNumber will be 0 the first time it attempts to reconnect, so this equation results in a reconnect pattern of 5 second, 10 seconds, 20 seconds, 40 seconds, 80 seconds, and then caps at 100 seconds until the maximum number of attempts is reached
            Math.min(Math.pow(2, reconnectCount.current) * 5000, 100_000)
          )
        } else {
          onClose?.(queryClient, event)
        }
      }

      const onAbort = () => {
        shouldReconnectRef.current = false
        websocket.close()
        if (timeout) {
          clearTimeout(timeout)
        }
        signal.removeEventListener('abort', onAbort)
      }
      signal.addEventListener('abort', onAbort)
    }

    connect({ signal: controller.signal })

    return () => {
      controller.abort()
    }
  }, [
    queryClient,
    getAccessTokenSilently,
    onOpen,
    onMessage,
    onError,
    onClose,
    url,
    searchParamsString,
    enabled,
    MAX_RECONNECT_ATTEMPTS,
  ])
}

export default useReactQueryWsSubscription
