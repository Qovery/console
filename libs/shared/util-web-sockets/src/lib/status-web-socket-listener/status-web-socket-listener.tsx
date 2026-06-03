import {
  useDeploymentStatusWebSocket,
  useRunningStatusWebSocket,
} from '../use-status-web-sockets/use-status-web-sockets'

export interface DeploymentStatusWebSocketListenerProps {
  clusterId: string
  organizationId: string
  projectId?: string
  environmentId?: string
  versionId?: string
}

export function DeploymentStatusWebSocketListener(props: DeploymentStatusWebSocketListenerProps) {
  useDeploymentStatusWebSocket(props)

  return null
}

export type RunningStatusWebSocketListenerProps = Omit<DeploymentStatusWebSocketListenerProps, 'versionId'>

export function RunningStatusWebSocketListener(props: RunningStatusWebSocketListenerProps) {
  useRunningStatusWebSocket(props)

  return null
}
