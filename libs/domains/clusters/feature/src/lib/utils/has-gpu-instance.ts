import { type Cluster } from 'qovery-typescript-axios'
import { getKarpenterFeatureValue } from './karpenter-feature-value'

export const hasGpuInstance = (cluster?: Cluster) => {
  return Boolean(getKarpenterFeatureValue(cluster)?.qovery_node_pools?.gpu_override)
}
