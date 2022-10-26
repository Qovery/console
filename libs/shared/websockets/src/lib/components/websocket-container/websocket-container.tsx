import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { selectClustersEntitiesByOrganizationId } from '@qovery/domains/organization'
import { useRunningStatusWebsocket } from '@qovery/shared/utils'
import { RootState } from '@qovery/store'
import { ClusterWebSocket } from '../cluster-web-socket/cluster-web-socket'

export function WebsocketContainer() {
  const { organizationId = '' } = useParams()

  const { openWebSockets, closeSockets, websocketsUrl } = useRunningStatusWebsocket()

  // const clusters = useSelector<RootState, Cluster[]>(selectClustersEntitiesByOrganizationIdMemoized(organizationId))
  // const clusters = useSelector<RootState, Cluster[]>(selectAllCluster)
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
