import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { selectClustersEntitiesByOrganizationId } from '@qovery/domains/organization'
import { useAuth } from '@qovery/shared/auth'
import { useRunningStatusWebsocket } from '@qovery/shared/utils'
import { RootState } from '@qovery/state/store'
import { ClusterWebSocket } from '../cluster-web-socket/cluster-web-socket'

/**
 * @deprecated This should be migrated to the new `use-status-web-sockets` hook
 */
export function WebsocketContainer() {
  const { organizationId = '' } = useParams()
  const { getAccessTokenSilently } = useAuth()

  const { openWebSockets, closeSockets, websocketsUrl } = useRunningStatusWebsocket({
    getAccessTokenSilently,
  })

  const clusters = useSelector((state: RootState) => selectClustersEntitiesByOrganizationId(state, organizationId))

  useEffect(() => {
    closeSockets()
  }, [organizationId, closeSockets])

  useEffect(() => {
    openWebSockets(
      organizationId,
      clusters.map((cluster) => cluster.id)
    ).then()
  }, [organizationId, clusters])

  return (
    <div>
      {websocketsUrl.map((url) => (
        <ClusterWebSocket key={url} url={url} />
      ))}
    </div>
  )
}

export default WebsocketContainer
