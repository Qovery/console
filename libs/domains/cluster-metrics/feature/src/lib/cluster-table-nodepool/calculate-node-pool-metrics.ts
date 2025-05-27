import type { ClusterNodeDto, NodePoolInfoDto } from 'qovery-ws-typescript-axios'

const KEY_KARPENTER_NODE_POOL = 'karpenter.sh/nodepool'

export interface NodePoolMetrics {
  cpuUsed: number
  cpuTotal: number | null
  cpuReserved: number
  memoryUsed: number
  memoryTotal: number | null
  memoryReserved: number
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
  cpuTotal = hasCpuLimit ? Math.round((nodePool.cpu_milli_limit || 0) / 1000) : null
  cpuReserved = Math.round((nodePool.cpu_milli || 0) / 1000)
  cpuUsed = Math.round(nodePoolNodes.reduce((acc, node) => acc + (node.metrics_usage?.cpu_milli_usage || 0), 0) / 1000)

  // Memory
  memoryTotal = hasMemoryLimit ? Math.round((nodePool.memory_mib_limit || 0) / 1024) : null
  memoryReserved = Math.round((nodePool.memory_mib || 0) / 1024)
  memoryUsed = Math.round(
    nodePoolNodes.reduce((acc, node) => acc + (node.metrics_usage?.memory_mib_rss_usage || 0), 0) / 1024
  )

  // Warning and deploying counts
  const nodesWarningCount = nodePoolNodes.filter((node) => node.name && nodeWarnings && nodeWarnings[node.name]).length
  const nodesDeployingCount = nodePoolNodes.filter(
    (node) => node.conditions?.find((condition) => condition.type === 'Ready')?.status === 'False'
  ).length

  return {
    cpuUsed,
    cpuTotal,
    cpuReserved,
    memoryUsed,
    memoryTotal,
    memoryReserved,
    nodesCount: nodePoolNodes.length,
    nodesWarningCount,
    nodesDeployingCount,
  }
}
