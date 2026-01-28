import {
  type ClusterFeatureKarpenterParameters,
  type ClusterFeatureKarpenterParametersResponse,
  type KarpenterGpuNodePoolOverride,
} from 'qovery-typescript-axios'

// Extended GPU override with disk_iops and disk_throughput
// TODO: Remove this extension once KarpenterGpuNodePoolOverride includes disk_iops and disk_throughput in the generated client
export interface KarpenterGpuNodePoolOverrideExtended extends KarpenterGpuNodePoolOverride {
  disk_iops?: number
  disk_throughput?: number
}

// Extended Karpenter parameters with gpu_override extension
// Only needed to extend gpu_override with disk_iops/disk_throughput fields
export interface ClusterFeatureKarpenterParametersExtended
  extends Omit<ClusterFeatureKarpenterParameters, 'qovery_node_pools'> {
  qovery_node_pools: Omit<ClusterFeatureKarpenterParameters['qovery_node_pools'], 'gpu_override'> & {
    gpu_override?: KarpenterGpuNodePoolOverrideExtended
  }
}

// Extended Karpenter feature response with extended parameters
export interface ClusterFeatureKarpenterParametersResponseExtended
  extends Omit<ClusterFeatureKarpenterParametersResponse, 'value'> {
  value: ClusterFeatureKarpenterParametersExtended
}
