import { useAuth0 } from '@auth0/auth0-react'
import { type QueryClient, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

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
  enabled?: boolean
}

interface InvalidateOperation {
  entity: string[]
  id?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isInvalidateOperation(data: any): data is InvalidateOperation {
  return Array.isArray(data?.entity)
}

export function useReactQueryWsSubscription({
  url,
  urlSearchParams,
  onMessage = (_, data) => console.error('Unhandled websocket onmessage, data:', data),
  enabled = true,
}: UseReactQueryWsSubscriptionProps) {
  const queryClient = useQueryClient()
  const { getAccessTokenSilently } = useAuth0()

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

  useEffect(() => {
    if (!enabled) {
      return
    }
    let websocket: WebSocket | undefined

      // XXX: This sounds ugly but its recommended by Auth0 ¯\_(ツ)_/¯
      // https://github.com/auth0/auth0-react/issues/97#issuecomment-677690436
    ;(async () => {
      const token = await getAccessTokenSilently()
      searchParams.append('bearer_token', token)
      websocket = new WebSocket(`${url}?${searchParams.toString()}`)

      websocket.onmessage = async (event) => {
        const data = JSON.parse(event.data)
        if (isInvalidateOperation(data)) {
          const queryKey = [...data.entity, data.id].filter(Boolean)
          queryClient.invalidateQueries({ queryKey })
        } else {
          // XXX: Don't know how to handle it, let the caller handle it
          onMessage(queryClient, data)
        }
      }
    })()

    return () => {
      if (websocket) {
        websocket.close()
      }
    }
  }, [queryClient, getAccessTokenSilently, onMessage, url, searchParams.toString(), enabled])
}

export default useReactQueryWsSubscription
