import { GetTokenSilentlyOptions } from '@auth0/auth0-react'
import { useCallback, useState } from 'react'

export interface RunningStatusWebsocketProps {
  getAccessTokenSilently: (options?: GetTokenSilentlyOptions) => Promise<string>
}

const baseUrl = 'wss://ws.qovery.com/service/status'

/**
 * @deprecated This should be migrated to the new `use-status-web-sockets` hook
 */
export function useRunningStatusWebsocket(props: RunningStatusWebsocketProps) {
  const { getAccessTokenSilently } = props
  const [websockets, setWebsockets] = useState<string[]>([])
  const [websocketsUrl, setWebsocketsUrl] = useState<string[]>([])
  const closeSockets = useCallback((): void => {
    setWebsockets([])
    setWebsocketsUrl([])
  }, [])

  const openWebSockets = async (organizationId: string, clusterIds: string[]): Promise<string[]> => {
    clusterIds.forEach((clusterId) => {
      openWebSocket(organizationId, clusterId)
    })

    return []
  }

  const openWebSocket = async (organizationId: string, clusterId: string): Promise<void> => {
    const token = await getAccessTokenSilently()

    setWebsockets((prevValue) => {
      const webSocketId = `${organizationId}-${clusterId}`
      if (prevValue.indexOf(webSocketId) === -1) return [...prevValue, webSocketId]
      return prevValue
    })
    setWebsocketsUrl((prevValue) => {
      const webSocketUrl = `${baseUrl}?organization=${organizationId}&cluster=${clusterId}&bearer_token=${token}`
      if (prevValue.indexOf(webSocketUrl) === -1) return [...prevValue, webSocketUrl]
      return prevValue
    })
  }

  return {
    websockets,
    websocketsUrl,
    closeSockets,
    openWebSockets,
  }
}

export default useRunningStatusWebsocket
