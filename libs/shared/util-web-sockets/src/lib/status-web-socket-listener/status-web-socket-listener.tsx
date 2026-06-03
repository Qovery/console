import useStatusWebSockets from '../use-status-web-sockets/use-status-web-sockets'

export interface StatusWebSocketListenerProps {
  clusterId: string
  organizationId: string
  projectId?: string
  environmentId?: string
  versionId?: string
  deploymentStatusEnabled?: boolean
  runningStatusEnabled?: boolean
}

export function StatusWebSocketListener({
  clusterId,
  organizationId,
  projectId,
  environmentId,
  versionId,
  deploymentStatusEnabled,
  runningStatusEnabled,
}: StatusWebSocketListenerProps) {
  useStatusWebSockets({
    organizationId,
    clusterId,
    projectId,
    environmentId,
    versionId,
    deploymentStatusEnabled,
    runningStatusEnabled,
  })

  return null
}

export default StatusWebSocketListener
