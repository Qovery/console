import { type ClusterNodeDto, type NodePoolInfoDto } from 'qovery-ws-typescript-axios'
import { formatNumber, mibToGib, milliCoreToVCPU } from '@qovery/shared/util-js'

const KEY_KARPENTER_NODE_POOL = 'karpenter.sh/nodepool'

export interface NodePoolMetrics {
  cpuTotal: number | null
  cpuCapacity: number
  memoryTotal: number | null
  memoryCapacity: number
  nodesCount: number
  nodesWarningCount: number
  nodesDeployingCount: number
}

export function calculateNodePoolMetrics(
  nodePool: NodePoolInfoDto,
  nodes: ClusterNodeDto[],
  nodeWarnings: Record<string, unknown>
): NodePoolMetrics {
  const nodePoolName = nodePool.name
  const nodePoolNodes = nodes.filter((node) => node.labels[KEY_KARPENTER_NODE_POOL] === nodePoolName)

  let cpuTotal: number | null = null
  let cpuCapacity = 0
  let memoryTotal: number | null = null
  let memoryCapacity = 0

  // If limits are set, use them, otherwise, set to null
  const hasCpuLimit = nodePool.cpu_milli_limit != null
  const hasMemoryLimit = nodePool.memory_mib_limit != null

  // vCPU
  cpuTotal = hasCpuLimit ? formatNumber(milliCoreToVCPU(nodePool.cpu_milli_limit || 0), 0) : null
  cpuCapacity = formatNumber(milliCoreToVCPU(nodePool.cpu_milli || 0), 0)

  // Memory
  memoryTotal = hasMemoryLimit ? formatNumber(mibToGib(nodePool.memory_mib_limit || 0), 0) : null
  memoryCapacity = formatNumber(mibToGib(nodePool.memory_mib || 0), 0)

  // Warning and deploying counts
  const nodesWarningCount = nodePoolNodes.filter((node) => node.name && nodeWarnings && nodeWarnings[node.name]).length
  const nodesDeployingCount = nodePoolNodes.filter(
    (node) => node.conditions?.find((condition) => condition.type === 'Ready')?.status === 'False'
  ).length

  return {
    cpuTotal,
    cpuCapacity,
    memoryCapacity,
    memoryTotal,
    nodesCount: nodePoolNodes.length,
    nodesWarningCount,
    nodesDeployingCount,
  }
}
