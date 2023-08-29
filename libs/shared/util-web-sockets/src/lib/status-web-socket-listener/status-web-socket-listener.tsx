import useStatusWebSockets from '../use-status-web-sockets/use-status-web-sockets'

export interface StatusWebSocketListenerProps {
  clusterId: string
  organizationId: string
  projectId?: string
  environmentId?: string
  versionId?: string
}

export function StatusWebSocketListener({
  clusterId,
  organizationId,
  projectId,
  environmentId,
  versionId,
}: StatusWebSocketListenerProps) {
  useStatusWebSockets({
    organizationId,
    clusterId,
    projectId,
    environmentId,
    versionId,
  })

  return null
}

export default StatusWebSocketListener
