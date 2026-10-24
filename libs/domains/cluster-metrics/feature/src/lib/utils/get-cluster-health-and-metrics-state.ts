import { type ClusterStateEnum } from 'qovery-typescript-axios'
import { type ClusterMetricsDto, type ClusterStatusDto } from 'qovery-ws-typescript-axios'

export function getClusterHealthAndMetricsState(
  deploymentStatus: ClusterStateEnum | undefined,
  health: ClusterStatusDto | null | undefined,
  metrics: ClusterMetricsDto | null | undefined
): 'stopped' | 'loading' | 'unavailable' | 'available' {
  // Explicit STOPPED status takes priority over retained health and metrics.
  if (deploymentStatus === 'STOPPED') return 'stopped'
  if (health === null || metrics === null) return 'unavailable'
  if (health === undefined || metrics === undefined) return 'loading'
  return 'available'
}
