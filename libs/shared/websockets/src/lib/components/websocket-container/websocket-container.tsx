import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@console/store/data'
import { useRunningStatusWebsocket } from '@console/shared/utils'
import { useParams } from 'react-router-dom'
import { ClusterWebSocket } from '../cluster-web-socket/cluster-web-socket'
import { selectClustersEntitiesByOrganizationId } from '@console/domains/organization'

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
