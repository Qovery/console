import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import { type QueryClient, useQueryClient } from 'react-query'

// Inspired by:
// https://tkdodo.eu/blog/using-web-sockets-with-react-query

export interface UseReactQueryWsSubscriptionProps {
  /** WebSocket origin and pathname */
  url: string
  /** WebSocket searchParams to be append. Note `bearer_token` is already handled by this hook */
  urlSearchParams?: URLSearchParams
  /** WebSocket onmessage will be automatically handled if they are aligned with the expected format (https://tkdodo.eu/blog/using-web-sockets-with-react-query#consuming-data) otherwise you should provide an handler */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMessage?: (queryClient: QueryClient, data: any) => void
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
  urlSearchParams = new URLSearchParams(),
  onMessage = (_, data) => console.error('Unhandled websocket onmessage, data:', data),
}: UseReactQueryWsSubscriptionProps) {
  const queryClient = useQueryClient()
  const { getAccessTokenSilently } = useAuth0()

  useEffect(() => {
    let websocket: WebSocket | undefined

      // XXX: This sounds ugly but its recommended by Auth0 ¯\_(ツ)_/¯
      // https://github.com/auth0/auth0-react/issues/97#issuecomment-677690436
    ;(async () => {
      const token = await getAccessTokenSilently()
      urlSearchParams.append('bearer_token', token)
      websocket = new WebSocket(`${url}?${urlSearchParams.toString()}`)

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
  }, [queryClient, getAccessTokenSilently, onMessage, url, urlSearchParams])
}

export default useReactQueryWsSubscription
