import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@console/store/data'
import { Cluster } from 'qovery-typescript-axios'
import { selectClustersEntitiesByOrganizationId } from '@console/domains/organization'
import { useRunningStatusWebsocket } from '@console/shared/utils'
import { useParams } from 'react-router-dom'
import { ClusterWebSocket } from '../cluster-web-socket/cluster-web-socket'

export function WebsocketContainer() {
  const { organizationId = '' } = useParams()
  const clusters = useSelector<RootState, Cluster[]>((state) =>
    selectClustersEntitiesByOrganizationId(state, organizationId)
  )
  const { openWebSockets, closeSockets, websocketsUrl } = useRunningStatusWebsocket()

  useEffect(() => {
    closeSockets()
  }, [organizationId])

  useEffect(() => {
    openWebSockets(
      organizationId,
      clusters.map((cluster) => cluster.id)
    )
  }, [organizationId, clusters, openWebSockets])

  return (
    <>
      {websocketsUrl.map((url) => (
        <ClusterWebSocket key={url} url={url} />
      ))}
    </>
  )
}

export default WebsocketContainer
