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
  savedGpu,
  gpu,
  minRunningInstances,
  maxRunningInstances,
}: {
  serviceType?: ServiceTypeEnum
  hasStorage: boolean
  cluster?: Cluster
  advancedSettings?: unknown
  savedGpu?: number
  gpu: number
  minRunningInstances: number
  maxRunningInstances: number
}): number | undefined {
  if (serviceType !== 'APPLICATION' && serviceType !== 'CONTAINER') return undefined
  if (hasStorage || !isApplicationOrContainerAdvancedSettings(advancedSettings)) return undefined
  if ((advancedSettings['deployment.update_strategy.type'] ?? 'RollingUpdate') !== 'RollingUpdate') return undefined

  const limits = getKarpenterFeatureValue(cluster)?.qovery_node_pools?.gpu_override?.limits
  if (!limits?.enabled || !limits.max_gpu || !(gpu > 0)) return undefined
  const maxGpu = limits.max_gpu

  const maxSurgePercent =
    advancedSettings['deployment.update_strategy.rolling_update.max_surge_percent'] ?? DEFAULT_MAX_SURGE_PERCENT
  const maxUnavailablePercent =
    advancedSettings['deployment.update_strategy.rolling_update.max_unavailable_percent'] ??
    DEFAULT_MAX_UNAVAILABLE_PERCENT

  const rolloutWaitsForGpu = (replicas: number, oldPodGpu: number) => {
    const oldPodsFit = replicas * oldPodGpu <= maxGpu && replicas * gpu <= maxGpu
    const extraPodFits = replicas * oldPodGpu + gpu <= maxGpu
    if (!oldPodsFit || extraPodFits) return false
    const { maxSurge, maxUnavailable } =
      maxRunningInstances === 1
        ? { maxSurge: 1, maxUnavailable: 0 }
        : {
            maxSurge: Math.ceil((replicas * maxSurgePercent) / 100),
            maxUnavailable: Math.floor((replicas * maxUnavailablePercent) / 100),
          }
    return maxSurge > 0 && maxUnavailable === 0
  }

  const oldPodGpus = savedGpu && savedGpu > 0 && savedGpu !== gpu ? [gpu, savedGpu] : [gpu]
  const replicasThatFit = Math.min(maxRunningInstances, Math.floor(maxGpu / Math.min(...oldPodGpus)))
  for (let replicas = Math.max(minRunningInstances, 1); replicas <= replicasThatFit; replicas++) {
    if (oldPodGpus.some((oldPodGpu) => rolloutWaitsForGpu(replicas, oldPodGpu))) return maxGpu
  }
  return undefined
}
