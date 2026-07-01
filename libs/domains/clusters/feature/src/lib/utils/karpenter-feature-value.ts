import { type Cluster, type ClusterFeatureKarpenterParameters } from 'qovery-typescript-axios'

function isKarpenterFeatureValue(value: unknown): value is ClusterFeatureKarpenterParameters {
  return Boolean(value && typeof value === 'object' && 'qovery_node_pools' in value)
}

export function getKarpenterFeatureValue(cluster?: Cluster) {
  const karpenterFeature = cluster?.features?.find((feature) => feature.id === 'KARPENTER')
  const value = karpenterFeature?.value_object?.value

  return isKarpenterFeatureValue(value) ? value : undefined
}
