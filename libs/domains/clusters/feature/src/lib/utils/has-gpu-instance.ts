import { type Cluster } from 'qovery-typescript-axios'

export const hasGpuInstance = (cluster?: Cluster) => {
  const clusterFeatureKarpenter = cluster?.features?.find((feature) => feature.id === 'KARPENTER')
  if (!clusterFeatureKarpenter) return false
  return Boolean(
    typeof clusterFeatureKarpenter?.value_object?.value === 'object' &&
      'qovery_node_pools' in clusterFeatureKarpenter.value_object.value &&
      clusterFeatureKarpenter.value_object.value.qovery_node_pools.gpu_override
  )
}
