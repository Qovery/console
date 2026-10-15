import { type ClusterStateEnum } from 'qovery-typescript-axios'
import { type ClusterMetricsDto, type ClusterStatusDto } from 'qovery-ws-typescript-axios'

export function getClusterRunningHealthAndMetricsStateWithStoppedPriority(
  deploymentStatus: ClusterStateEnum | undefined,
  health: ClusterStatusDto | null | undefined,
  metrics: ClusterMetricsDto | null | undefined
): 'stopped' | 'loading' | 'unavailable' | 'available' {
  if (deploymentStatus === 'STOPPED') return 'stopped'
  if (health === null || metrics === null) return 'unavailable'
  if (health === undefined || metrics === undefined) return 'loading'
  return 'available'
}
