import {
  type Cluster,
  type ClusterFeatureKarpenterParameters,
  type ClusterFeatureKarpenterParametersResponse,
  type KarpenterGpuNodePoolOverride,
} from 'qovery-typescript-axios'

// Extended GPU override with disk_iops and disk_throughput
export interface KarpenterGpuNodePoolOverrideExtended extends KarpenterGpuNodePoolOverride {
  disk_iops?: number
  disk_throughput?: number
}

// Extended Karpenter parameters with disk_iops and disk_throughput
export interface ClusterFeatureKarpenterParametersExtended
  extends Omit<ClusterFeatureKarpenterParameters, 'qovery_node_pools'> {
  disk_iops?: number
  disk_throughput?: number
  qovery_node_pools: Omit<ClusterFeatureKarpenterParameters['qovery_node_pools'], 'gpu_override'> & {
    gpu_override?: KarpenterGpuNodePoolOverrideExtended
  }
}

// Extended Karpenter feature response with extended parameters
export interface ClusterFeatureKarpenterParametersResponseExtended
  extends Omit<ClusterFeatureKarpenterParametersResponse, 'value'> {
  value: ClusterFeatureKarpenterParametersExtended
}

// Extended Cluster type with disk_iops and disk_throughput fields
// These will be available once the API client is regenerated
export interface ClusterExtended extends Cluster {
  disk_iops?: number
  disk_throughput?: number
}
