import { type ClusterNodeDto, type NodePoolInfoDto } from 'qovery-ws-typescript-axios'
import { formatNumber, mibToGib, milliCoreToVCPU } from '@qovery/shared/util-js'

const KEY_KARPENTER_NODE_POOL = 'karpenter.sh/nodepool'

export interface NodePoolMetrics {
  cpuUsed: number
  cpuTotal: number | null
  cpuReserved: number
  cpuUsedRaw: number
  cpuTotalRaw: number | null
  memoryUsed: number
  memoryTotal: number | null
  memoryReserved: number
  memoryUsedRaw: number
  memoryTotalRaw: number | null
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
  let cpuReserved = 0
  let memoryTotal: number | null = null
  let memoryReserved = 0
  let cpuUsed = 0
  let memoryUsed = 0

  // If limits are set, use them, otherwise, set to null
  const hasCpuLimit = nodePool.cpu_milli_limit != null
  const hasMemoryLimit = nodePool.memory_mib_limit != null

  // vCPU
  cpuTotal = hasCpuLimit ? formatNumber(milliCoreToVCPU(nodePool.cpu_milli_limit || 0), 0) : null
  cpuReserved = formatNumber(milliCoreToVCPU(nodePool.cpu_milli || 0), 0)
  cpuUsed = formatNumber(
    milliCoreToVCPU(nodePoolNodes.reduce((acc, node) => acc + (node.resources_allocated.request_cpu_milli || 0), 0)),
    0
  )

  // Memory
  memoryTotal = hasMemoryLimit ? formatNumber(mibToGib(nodePool.memory_mib_limit || 0), 0) : null
  memoryReserved = formatNumber(mibToGib(nodePool.memory_mib || 0), 0)
  memoryUsed = formatNumber(
    mibToGib(nodePoolNodes.reduce((acc, node) => acc + (node.resources_allocated.request_memory_mib || 0), 0)),
    0
  )

  // Warning and deploying counts
  const nodesWarningCount = nodePoolNodes.filter((node) => node.name && nodeWarnings && nodeWarnings[node.name]).length
  const nodesDeployingCount = nodePoolNodes.filter(
    (node) => node.conditions?.find((condition) => condition.type === 'Ready')?.status === 'False'
  ).length

  // Calculate raw values for accurate percentage calculation
  const cpuUsedRaw = milliCoreToVCPU(
    nodePoolNodes.reduce((acc, node) => acc + (node.resources_allocated.request_cpu_milli || 0), 0)
  )
  const cpuTotalRaw = hasCpuLimit ? milliCoreToVCPU(nodePool.cpu_milli_limit || 0) : null
  const memoryUsedRaw = mibToGib(
    nodePoolNodes.reduce((acc, node) => acc + (node.resources_allocated.request_memory_mib || 0), 0)
  )
  const memoryTotalRaw = hasMemoryLimit ? mibToGib(nodePool.memory_mib_limit || 0) : null

  return {
    cpuUsed,
    cpuTotal,
    cpuReserved,
    cpuUsedRaw,
    cpuTotalRaw,
    memoryUsed,
    memoryTotal,
    memoryReserved,
    memoryUsedRaw,
    memoryTotalRaw,
    nodesCount: nodePoolNodes.length,
    nodesWarningCount,
    nodesDeployingCount,
  }
}
