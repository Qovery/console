import { type Cluster } from 'qovery-typescript-axios'

export function getKarpenterFeatureValue(cluster?: Cluster) {
  const karpenterFeature = cluster?.features?.find((feature) => feature.id === 'KARPENTER')
  const valueObject = karpenterFeature?.value_object

  return valueObject?.type === 'KARPENTER' ? valueObject.value : undefined
}
