import { type ClusterNodeDto } from 'qovery-ws-typescript-axios'
import { getClusterNodePools } from './get-node-pools'

const node = (name?: string): Pick<ClusterNodeDto, 'labels' | 'resources_capacity'> => ({
  labels: name ? { 'karpenter.sh/nodepool': name } : {},
  resources_capacity: { cpu_milli: 2000, memory_mib: 4096, ephemeral_storage_mib: 10000, pods: 110 },
})

describe('getClusterNodePools', () => {
  it('groups labelled nodes and leaves infrastructure outside application pools', () => {
    expect(getClusterNodePools([], [node('stable'), node('demo'), node('demo'), node(), node('')])).toEqual([
      { name: 'demo', cpu_milli: 4000, memory_mib: 8192, nodes_count: 2 },
      { name: 'stable', cpu_milli: 2000, memory_mib: 4096, nodes_count: 1 },
    ])
  })

  it('preserves reported metrics, limits and empty pools when adding missing pools', () => {
    const pool = Object.freeze({
      name: 'default',
      cpu_milli: 8000,
      memory_mib: 16384,
      nodes_count: 2,
      cpu_milli_limit: 16000,
    })
    const emptyPool = Object.freeze({ name: 'empty', cpu_milli: 0, memory_mib: 0, nodes_count: 0 })
    const pools = Object.freeze([pool, emptyPool])
    const result = getClusterNodePools(pools, [node('default'), node('demo')])
    expect(result).toHaveLength(3)
    expect(result[0]).toBe(pool)
    expect(result[1]).toBe(emptyPool)
    expect(result[2].name).toBe('demo')
    expect(result[2].cpu_milli_limit).toBeUndefined()
    expect(result[2].memory_mib_limit).toBeUndefined()
  })

  it('does not create pools for clusters without Karpenter labels', () => {
    expect(getClusterNodePools()).toEqual([])
    expect(getClusterNodePools([], [node()])).toEqual([])
  })
})
