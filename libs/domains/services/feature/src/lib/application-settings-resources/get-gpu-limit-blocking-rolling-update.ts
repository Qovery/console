import {
  type ApplicationAdvancedSettings,
  type Cluster,
  type ContainerAdvancedSettings,
  type ServiceTypeEnum,
} from 'qovery-typescript-axios'
import { getKarpenterFeatureValue } from '@qovery/domains/clusters/feature'

const DEFAULT_MAX_SURGE_PERCENT = 25
const DEFAULT_MAX_UNAVAILABLE_PERCENT = 25

function isApplicationOrContainerAdvancedSettings(
  advancedSettings: unknown
): advancedSettings is ApplicationAdvancedSettings | ContainerAdvancedSettings {
  return typeof advancedSettings === 'object' && advancedSettings !== null
}

export function getGpuLimitBlockingRollingUpdate({
  serviceType,
  hasStorage,
  cluster,
  advancedSettings,
  gpu,
  minRunningInstances,
  maxRunningInstances,
}: {
  serviceType?: ServiceTypeEnum
  hasStorage: boolean
  cluster?: Cluster
  advancedSettings?: unknown
  gpu: number
  minRunningInstances: number
  maxRunningInstances: number
}): number | undefined {
  if (serviceType !== 'APPLICATION' && serviceType !== 'CONTAINER') return undefined
  if (hasStorage || !isApplicationOrContainerAdvancedSettings(advancedSettings)) return undefined
  if ((advancedSettings['deployment.update_strategy.type'] ?? 'RollingUpdate') !== 'RollingUpdate') return undefined

  const limits = getKarpenterFeatureValue(cluster)?.qovery_node_pools?.gpu_override?.limits
  if (!limits?.enabled || !limits.max_gpu || !(gpu > 0)) return undefined

  const replicasFillingPool = Math.floor(limits.max_gpu / gpu)
  const canRunReplicasFillingPool =
    replicasFillingPool >= Math.max(minRunningInstances, 1) && replicasFillingPool <= maxRunningInstances
  if (!canRunReplicasFillingPool) return undefined

  const maxSurgePercent =
    advancedSettings['deployment.update_strategy.rolling_update.max_surge_percent'] ?? DEFAULT_MAX_SURGE_PERCENT
  const maxUnavailablePercent =
    advancedSettings['deployment.update_strategy.rolling_update.max_unavailable_percent'] ??
    DEFAULT_MAX_UNAVAILABLE_PERCENT
  const { maxSurge, maxUnavailable } =
    maxRunningInstances === 1
      ? { maxSurge: 1, maxUnavailable: 0 }
      : {
          maxSurge: Math.ceil((replicasFillingPool * maxSurgePercent) / 100),
          maxUnavailable: Math.floor((replicasFillingPool * maxUnavailablePercent) / 100),
        }

  return maxSurge > 0 && maxUnavailable === 0 ? limits.max_gpu : undefined
}
