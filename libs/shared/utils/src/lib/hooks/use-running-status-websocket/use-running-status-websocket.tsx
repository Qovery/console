import { useCallback, useState } from 'react'
import { useAuth } from '@qovery/shared/auth'

export interface RunningStatusWebsocketProps {
  organizationId: string
}

const baseUrl = 'wss://ws.qovery.com/service/status'

export function useRunningStatusWebsocket() {
  const [websockets, setWebsockets] = useState<string[]>([])
  const [websocketsUrl, setWebsocketsUrl] = useState<string[]>([])
  const { getAccessTokenSilently } = useAuth()

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
