import { type ClusterNodeDto } from 'qovery-ws-typescript-axios'
import { calculateClusterResources, formatNumber, mibToGib, milliCoreToVCPU } from './calculate-cluster-resources'

describe('Conversion Utility Functions', () => {
  it('should convert MiB to GiB correctly', () => {
    expect(mibToGib(1024)).toBe(1)
    expect(mibToGib(2048)).toBe(2)
    expect(mibToGib(512)).toBe(0.5)
    expect(mibToGib(0)).toBe(0)
  })

  it('should convert millicores to vCPU correctly', () => {
    expect(milliCoreToVCPU(1000)).toBe(1)
    expect(milliCoreToVCPU(2500)).toBe(2.5)
    expect(milliCoreToVCPU(500)).toBe(0.5)
    expect(milliCoreToVCPU(0)).toBe(0)
  })

  it('should format numbers to the specified precision', () => {
    expect(formatNumber(1.2345, 2)).toBe(1.23)
    expect(formatNumber(1.2345, 3)).toBe(1.234)
    expect(formatNumber(1.2, 0)).toBe(1)
  })

  it('should use default precision of 2 when not specified', () => {
    expect(formatNumber(1.2345)).toBe(1.23)
    expect(formatNumber(1.2)).toBe(1.2)
  })

  it('should handle NaN and return 0', () => {
    expect(formatNumber(NaN)).toBe(0)
  })

  it('should handle integer numbers', () => {
    expect(formatNumber(5)).toBe(5)
  })
})

describe('calculateClusterResources', () => {
  const createMockNode = (
    cpuAllocatable: number,
    cpuUsage: number | null,
    memoryAllocatable: number,
    memoryUsage: number | null,
    diskAllocatable: number,
    diskUsage: number | null
  ): ClusterNodeDto => ({
    resources_allocatable: {
      cpu_milli: cpuAllocatable,
      memory_mib: memoryAllocatable,
      ephemeral_storage_mib: diskAllocatable,
    },
    metrics_usage: {
      cpu_milli_usage: cpuUsage,
      memory_mib_working_set_usage: memoryUsage,
      disk_mib_usage: diskUsage,
    },
    id: 'mock-id',
    name: 'mock-name',
    type: 'mock-type',
    kubernetes_version: 'mock-version',
    region: 'mock-region',
    state: 'RUNNING',
    resources_capacity: {
      cpu_milli: 0,
      memory_mib: 0,
      ephemeral_storage_mib: 0,
    },
    created_at: '',
  })

  it('should return correct resources when nodes are provided', () => {
    const nodes: ClusterNodeDto[] = [
      createMockNode(2000, 1000, 2048, 1024, 4096, 2048),
      createMockNode(3000, 1500, 4096, 2048, 8192, 4096),
    ]

    const result = calculateClusterResources(nodes)

    expect(result.cpu.total).toBe(7.5)
    expect(result.cpu.used).toBe(2.5)
    expect(result.cpu.percent).toBe(33.33)
    expect(result.cpu.unit).toBe('vCPU')

    expect(result.memory.total).toBe(9)
    expect(result.memory.used).toBe(3)
    expect(result.memory.percent).toBe(33.33)
    expect(result.memory.unit).toBe('GB')

    expect(result.disk.total).toBe(18)
    expect(result.disk.used).toBe(6)
    expect(result.disk.percent).toBe(33.33)
    expect(result.disk.unit).toBe('GB')
  })

  it('should handle nodes with null usage values', () => {
    const nodes: ClusterNodeDto[] = [
      createMockNode(2000, null, 2048, null, 4096, null),
      createMockNode(3000, 1500, 4096, 2048, 8192, 4096),
    ]

    const result = calculateClusterResources(nodes)

    expect(result.cpu.total).toBe(6.5)
    expect(result.cpu.used).toBe(1.5)
    expect(result.cpu.percent).toBe(23.08)

    expect(result.memory.total).toBe(8)
    expect(result.memory.used).toBe(2)
    expect(result.memory.percent).toBe(25)

    expect(result.disk.total).toBe(16)
    expect(result.disk.used).toBe(4)
    expect(result.disk.percent).toBe(25)
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
