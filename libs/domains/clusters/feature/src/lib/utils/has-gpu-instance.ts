import { type Cluster } from 'qovery-typescript-axios'

export const hasGpuInstance = (cluster?: Cluster) => {
  const clusterFeatureKarpenter = cluster?.features?.find((feature) => feature.id === 'KARPENTER')
  if (!clusterFeatureKarpenter) return false
  const karpenterValue = clusterFeatureKarpenter.value_object?.value

  return Boolean(
    karpenterValue &&
      typeof karpenterValue === 'object' &&
      'qovery_node_pools' in karpenterValue &&
      karpenterValue.qovery_node_pools.gpu_override
  )
}
