import { type ClusterNodeDto } from 'qovery-ws-typescript-axios'
import { calculateClusterResources } from './calculate-cluster-resources'

describe('calculateClusterResources', () => {
  const createMockNode = (
    cpuCapacity: number,
    cpuRequest: number,
    memoryCapacity: number,
    memoryRequest: number,
    diskCapacity: number,
    diskUsage: number | null
  ): ClusterNodeDto => ({
    resources_capacity: {
      cpu_milli: cpuCapacity,
      memory_mib: memoryCapacity,
      ephemeral_storage_mib: diskCapacity,
      pods: 0,
    },
    resources_allocated: {
      request_cpu_milli: cpuRequest,
      request_memory_mib: memoryRequest,
      limit_cpu_milli: cpuRequest,
      limit_memory_mib: memoryRequest,
    },
    metrics_usage: {
      cpu_milli_usage: cpuRequest,
      memory_mib_working_set_usage: memoryRequest,
      memory_mib_rss_usage: memoryRequest,
      disk_mib_usage: diskUsage,
    },
    name: 'mock-name',
    resources_allocatable: {
      cpu_milli: cpuCapacity,
      memory_mib: memoryCapacity,
      ephemeral_storage_mib: diskCapacity,
      pods: 0,
    },
    conditions: [],
    addresses: [],
    annotations: {},
    architecture: 'amd64',
    created_at: Date.now(),
    kubelet_version: 'v1.24.0',
    operating_system: 'linux',
    kernel_version: '5.15.0',
    os_image: 'Ubuntu 22.04 LTS',
    pods: [],
    taints: [],
    unschedulable: false,
    labels: {},
  })

  it('should return correct resources when nodes are provided', () => {
    const nodes: ClusterNodeDto[] = [
      createMockNode(2000, 1000, 2048, 1024, 4096, 2048),
      createMockNode(3000, 1500, 4096, 2048, 8192, 4096),
    ]

    const result = calculateClusterResources(nodes)

    expect(result.cpu.total).toBe(5)
    expect(result.cpu.used).toBe(2.5)
    expect(result.cpu.percent).toBe(50)
    expect(result.cpu.unit).toBe('vCPU')

    expect(result.memory.total).toBe(6)
    expect(result.memory.used).toBe(3)
    expect(result.memory.percent).toBe(50)
    expect(result.memory.unit).toBe('GB')

    expect(result.disk.total).toBe(12)
    expect(result.disk.used).toBe(6)
    expect(result.disk.percent).toBe(50)
    expect(result.disk.unit).toBe('GB')
  })

  it('should handle nodes with null usage values', () => {
    const nodes: ClusterNodeDto[] = [
      createMockNode(2000, 1000, 2048, 1024, 4096, null),
      createMockNode(3000, 1500, 4096, 2048, 8192, 4096),
    ]

    const result = calculateClusterResources(nodes)

    expect(result.cpu.total).toBe(5)
    expect(result.cpu.used).toBe(2.5)
    expect(result.cpu.percent).toBe(50)

    expect(result.memory.total).toBe(6)
    expect(result.memory.used).toBe(3)
    expect(result.memory.percent).toBe(50)

    expect(result.disk.total).toBe(12)
    expect(result.disk.used).toBe(4)
    expect(result.disk.percent).toBe(33.33)
  })

  it('should handle empty nodes array', () => {
    const result = calculateClusterResources([])

    expect(result.cpu.total).toBe(0)
    expect(result.cpu.used).toBe(0)
    expect(result.cpu.percent).toBe(0)

    expect(result.memory.total).toBe(0)
    expect(result.memory.used).toBe(0)
    expect(result.memory.percent).toBe(0)

    expect(result.disk.total).toBe(0)
    expect(result.disk.used).toBe(0)
    expect(result.disk.percent).toBe(0)
  })

  it('should handle undefined nodes', () => {
    const result = calculateClusterResources(undefined)

    expect(result.cpu.total).toBe(0)
    expect(result.cpu.used).toBe(0)
    expect(result.cpu.percent).toBe(0)

    expect(result.memory.total).toBe(0)
    expect(result.memory.used).toBe(0)
    expect(result.memory.percent).toBe(0)

    expect(result.disk.total).toBe(0)
    expect(result.disk.used).toBe(0)
    expect(result.disk.percent).toBe(0)
  })

  it('should avoid division by zero when totals are zero', () => {
    const nodes: ClusterNodeDto[] = [createMockNode(0, 0, 0, 0, 0, 0)]

    const result = calculateClusterResources(nodes)

    expect(result.cpu.total).toBe(0)
    expect(result.cpu.used).toBe(0)
    expect(result.cpu.percent).toBe(0)

    expect(result.memory.total).toBe(0)
    expect(result.memory.used).toBe(0)
    expect(result.memory.percent).toBe(0)

    expect(result.disk.total).toBe(0)
    expect(result.disk.used).toBe(0)
    expect(result.disk.percent).toBe(0)
  })
})
