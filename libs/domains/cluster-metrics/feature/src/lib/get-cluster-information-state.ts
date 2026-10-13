import { type ClusterStateEnum } from 'qovery-typescript-axios'
import { type ClusterMetricsDto, type ClusterStatusDto } from 'qovery-ws-typescript-axios'
import { getPresentationState } from '@qovery/state/util-queries'

export function getClusterInformationState(
  deploymentStatus: ClusterStateEnum | undefined,
  health: ClusterStatusDto | 'NotFound' | null | undefined,
  metrics: ClusterMetricsDto | null | undefined
): 'stopped' | 'loading' | 'unavailable' | 'available' {
  if (deploymentStatus === 'STOPPED') return 'stopped'
  const healthState = getPresentationState(health).status
  const metricsState = getPresentationState(metrics).status
  if (healthState === 'unavailable' || metricsState === 'unavailable') return 'unavailable'
  if (healthState === 'loading' || metricsState === 'loading') return 'loading'
  return 'available'
}
