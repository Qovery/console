export type KarpenterFeatureValue = {
  qovery_node_pools?: {
    gpu_override?: unknown
    requirements?: Array<{
      key?: string
      values?: string[]
    }>
  }
}

type ClusterWithFeatures = {
  features?: Array<{
    id?: string
    value_object?: {
      value?: unknown
    } | null
    value?: unknown
  }>
}

function isKarpenterFeatureValue(value: unknown): value is KarpenterFeatureValue {
  return Boolean(value && typeof value === 'object' && 'qovery_node_pools' in value)
}

export function getKarpenterFeatureValue(cluster?: ClusterWithFeatures) {
  const karpenterFeature = cluster?.features?.find((feature) => feature.id === 'KARPENTER')
  const rawKarpenterValue = karpenterFeature?.value_object?.value ?? karpenterFeature?.value

  return isKarpenterFeatureValue(rawKarpenterValue) ? rawKarpenterValue : undefined
}
