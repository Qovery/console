import { type ClusterNodeDto, type NodePoolInfoDto } from 'qovery-ws-typescript-axios'

// Self-managed clusters can report node labels without reporting Karpenter pool metadata.
// Preserve authoritative pool metrics and infer only missing pools, with unknown limits.
export function getClusterNodePools(
  nodePools: readonly NodePoolInfoDto[] = [],
  nodes: ReadonlyArray<Pick<ClusterNodeDto, 'labels' | 'resources_capacity'>> = []
): NodePoolInfoDto[] {
  const reportedNames = new Set(nodePools.map((pool) => pool.name))
  const inferredPools = new Map<string, NodePoolInfoDto>()

  for (const node of nodes) {
    const name = node.labels['karpenter.sh/nodepool']
    if (!name || reportedNames.has(name)) continue

    const pool = inferredPools.get(name) ?? { name, cpu_milli: 0, memory_mib: 0, nodes_count: 0 }
    pool.cpu_milli += node.resources_capacity.cpu_milli
    pool.memory_mib += node.resources_capacity.memory_mib
    pool.nodes_count += 1
    inferredPools.set(name, pool)
  }

  return [...nodePools, ...Array.from(inferredPools.values()).sort((a, b) => a.name.localeCompare(b.name))]
}
