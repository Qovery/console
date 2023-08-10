import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import { type QueryClient, useQueryClient } from 'react-query'

// Inspired by:
// https://tkdodo.eu/blog/using-web-sockets-with-react-query

export interface UseReactQueryWsSubscriptionProps {
  /** WebSocket origin and pathname */
  url: string
  /** WebSocket searchParams is an object then converted to URLSearchParams. Note `bearer_token` is already handled by this hook */
  urlSearchParams?: SearchParams
  /** WebSocket onmessage will be automatically handled if they are aligned with the expected format (https://tkdodo.eu/blog/using-web-sockets-with-react-query#consuming-data) otherwise you should provide an handler */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMessage?: (queryClient: QueryClient, data: any) => void
}

interface InvalidateOperation {
  entity: string[]
  id?: string
}

interface SearchParams {
  [key: string]: string | undefined
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isInvalidateOperation(data: any): data is InvalidateOperation {
  return Array.isArray(data?.entity)
}

function filterObject(obj: SearchParams) {
  const filteredObject: Record<string, string> = {}

  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    if (value !== undefined && value.trim() !== '') {
      filteredObject[key] = value.trim()
    }
  })

  return filteredObject
}

export function useReactQueryWsSubscription({
  url,
  urlSearchParams,
  onMessage = (_, data) => console.error('Unhandled websocket onmessage, data:', data),
}: UseReactQueryWsSubscriptionProps) {
  const queryClient = useQueryClient()
  const { getAccessTokenSilently } = useAuth0()

  const searchParams = new URLSearchParams(filterObject(urlSearchParams || {}))

  useEffect(() => {
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
  }, [queryClient, getAccessTokenSilently, onMessage, url, urlSearchParams])
}

export default useReactQueryWsSubscription
