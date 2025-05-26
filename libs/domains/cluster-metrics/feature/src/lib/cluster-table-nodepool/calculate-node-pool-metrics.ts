import { type ClusterNodeDto } from 'qovery-ws-typescript-axios'

const KEY_KARPENTER_NODE_POOL = 'karpenter.sh/nodepool'

export interface NodePoolMetrics {
  cpuUsed: number
  cpuTotal: number
  cpuReserved: number
  memoryUsed: number
  memoryTotal: number
  memoryReserved: number
  nodesCount: number
  nodesWarningCount: number
  nodesDeployingCount: number
}

export function calculateNodePoolMetrics(
  nodePoolName: string,
  nodes: ClusterNodeDto[],
  nodeWarnings: Record<string, unknown>
): NodePoolMetrics {
  const nodePoolNodes = nodes.filter((node) => node.labels[KEY_KARPENTER_NODE_POOL] === nodePoolName)

  const metrics = nodePoolNodes.reduce(
    (acc, node) => {
      // CPU metrics
      acc.cpuUsed += node.metrics_usage.cpu_milli_usage || 0
      acc.cpuReserved += node.resources_allocated?.request_cpu_milli || 0
      acc.cpuTotal += node.resources_capacity?.cpu_milli || 0

      // Memory metrics
      acc.memoryUsed += node.metrics_usage?.memory_mib_working_set_usage || 0
      acc.memoryReserved += node.resources_allocated?.request_memory_mib || 0
      acc.memoryTotal += node.resources_capacity?.memory_mib || 0

      // Warning count
      if (node.name && nodeWarnings && nodeWarnings[node.name]) {
        acc.nodesWarningCount += 1
      }

      // Deploying count
      if (node.conditions?.find((condition) => condition.type === 'Ready')?.status === 'False') {
        acc.nodesDeployingCount += 1
      }

      return acc
    },
    {
      cpuUsed: 0,
      cpuTotal: 0,
      cpuReserved: 0,
      memoryUsed: 0,
      memoryTotal: 0,
      memoryReserved: 0,
      nodesCount: nodePoolNodes.length,
      nodesWarningCount: 0,
      nodesDeployingCount: 0,
    }
  )

  return {
    ...metrics,
    cpuUsed: Math.round(metrics.cpuUsed / 1000), // vCPU
    cpuTotal: Math.round(metrics.cpuTotal / 1000), // vCPU
    cpuReserved: Math.round(metrics.cpuReserved / 1000), // vCPU
    memoryUsed: Math.round(metrics.memoryUsed / 1024), // GB
    memoryTotal: Math.round(metrics.memoryTotal / 1024), // GB
    memoryReserved: Math.round(metrics.memoryReserved / 1024), // GB
    nodesCount: metrics.nodesCount,
    nodesWarningCount: metrics.nodesWarningCount,
    nodesDeployingCount: metrics.nodesDeployingCount,
  }
}
