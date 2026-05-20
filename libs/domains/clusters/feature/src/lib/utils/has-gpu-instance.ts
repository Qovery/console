import { type Cluster } from 'qovery-typescript-axios'

export const hasGpuInstance = (cluster?: Cluster) => {
  const clusterFeatureKarpenter = cluster?.features?.find((feature) => feature.id === 'KARPENTER')
  const karpenterValue = clusterFeatureKarpenter?.value_object?.value

  if (!karpenterValue || typeof karpenterValue !== 'object' || !('qovery_node_pools' in karpenterValue)) {
    return false
  }

  return Boolean(karpenterValue.qovery_node_pools.gpu_override)
}
