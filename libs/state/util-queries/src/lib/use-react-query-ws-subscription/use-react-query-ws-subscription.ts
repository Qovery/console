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
  onQueryInvalidated?: (queryClient: QueryClient, data: InvalidateOperation) => void
  onOpen?: (queryClient: QueryClient, event: Event) => void
  onError?: (queryClient: QueryClient, event: Event) => void
  onClose?: (QueryClient: QueryClient, event: CloseEvent) => void
  /** Called on every unexpected close, including while automatic retries continue. */
  onDisconnect?: (queryClient: QueryClient, event: CloseEvent) => void
  maxReconnectDelay?: number
  onConnectionError?: (error: unknown) => void
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

function parseWebSocketMessageData(data: MessageEvent['data']) {
  if (typeof data !== 'string') {
    return data
  }

  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}

// TODO: Add better naming for the hook we can use it without ReactQuery
export function useReactQueryWsSubscription({
  url,
  urlSearchParams,
  onMessage,
  onQueryInvalidated,
  onOpen,
  onError,
  onClose,
  onDisconnect,
  maxReconnectDelay = 100_000,
  onConnectionError,
  enabled = true,
  shouldReconnect = false,
}: UseReactQueryWsSubscriptionProps) {
  const queryClient = useQueryClient()
  const { getAccessTokenSilently } = useAuth0()

  const MAX_RECONNECT_ATTEMPTS = typeof shouldReconnect === 'number' ? shouldReconnect : Infinity

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
  const searchParamsString = searchParams.toString()
  const reconnectCount = useRef<number>(0)
  const queryClientRef = useRef(queryClient)
  const getAccessTokenSilentlyRef = useRef(getAccessTokenSilently)
  const callbacksRef = useRef({
    onClose,
    onDisconnect,
    onError,
    onMessage,
    onOpen,
    onQueryInvalidated,
    onConnectionError,
  })

  queryClientRef.current = queryClient
  getAccessTokenSilentlyRef.current = getAccessTokenSilently
  callbacksRef.current = { onClose, onDisconnect, onError, onMessage, onOpen, onQueryInvalidated, onConnectionError }

  useEffect(() => {
    if (!enabled) {
      return
    }

    let timeout: ReturnType<typeof setTimeout> | undefined
    const controller = new AbortController()
    const canReconnect = shouldReconnect
    let websocket: WebSocket | undefined
    reconnectCount.current = 0

    function scheduleReconnect() {
      if (controller.signal.aborted || !canReconnect || reconnectCount.current >= MAX_RECONNECT_ATTEMPTS) return false
      timeout = setTimeout(
        () => {
          timeout = undefined
          reconnectCount.current++
          void connect({ signal: controller.signal })
        },
        Math.min(Math.pow(2, reconnectCount.current) * 5000, maxReconnectDelay)
      )
      return true
    }

    async function connect({ signal }: { signal: AbortSignal }) {
      let socket: WebSocket
      try {
        const token = await getAccessTokenSilentlyRef.current()
        if (signal.aborted) return
        socket = new WebSocket(`${url}?${searchParamsString}`, ['v1', 'auth.bearer.' + token])
        websocket = socket
      } catch (error) {
        if (signal.aborted) return
        callbacksRef.current.onConnectionError?.(error)
        const code = typeof error === 'object' && error !== null && 'error' in error ? error.error : undefined
        // These require user interaction; network/time-out failures may recover.
        if (
          !['login_required', 'consent_required', 'interaction_required', 'invalid_grant', 'access_denied'].includes(
            String(code)
          )
        ) {
          scheduleReconnect()
        }
        return
      }

      socket.onopen = async (event) => {
        if (signal.aborted) return
        callbacksRef.current.onOpen?.(queryClientRef.current, event)
      }
      socket.onmessage = async (event) => {
        if (signal.aborted) {
          return
        }

        reconnectCount.current = 0
        const data = parseWebSocketMessageData(event.data)

        if (isInvalidateOperation(data)) {
          const queryKey = [...data.entity, data.id].filter(Boolean)
          queryClientRef.current.invalidateQueries({ queryKey })
          callbacksRef.current.onQueryInvalidated?.(queryClientRef.current, data)
        } else {
          // XXX: Don't know how to handle it, let the caller handle it
          callbacksRef.current.onMessage?.(queryClientRef.current, data)
        }
      }
      socket.onerror = async (event) => {
        if (signal.aborted) return
        callbacksRef.current.onError?.(queryClientRef.current, event)
      }
      socket.onclose = async (event) => {
        if (signal.aborted) {
          return
        }

        callbacksRef.current.onDisconnect?.(queryClientRef.current, event)

        if (!scheduleReconnect()) {
          callbacksRef.current.onClose?.(queryClientRef.current, event)
        }
      }
    }

    connect({ signal: controller.signal })

    return () => {
      controller.abort()
      clearTimeout(timeout)
      websocket?.close()
    }
  }, [shouldReconnect, MAX_RECONNECT_ATTEMPTS, maxReconnectDelay, url, searchParamsString, enabled])
}

export default useReactQueryWsSubscription
