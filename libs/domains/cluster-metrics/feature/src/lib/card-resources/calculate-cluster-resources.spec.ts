import { type ClusterNodeDto } from 'qovery-ws-typescript-axios'
import { calculateClusterResources, formatNumber, mibToGib, milliCoreToVCPU } from './calculate-cluster-resources'

describe('Resource Conversion Utilities', () => {
  describe('mibToGib', () => {
    it('should correctly convert MiB to GiB', () => {
      expect(mibToGib(1024)).toBe(1)
      expect(mibToGib(2048)).toBe(2)
      expect(mibToGib(512)).toBe(0.5)
      expect(mibToGib(0)).toBe(0)
    })
  })

  describe('milliCoreToVCPU', () => {
    it('should correctly convert millicores to vCPU', () => {
      expect(milliCoreToVCPU(1000)).toBe(1)
      expect(milliCoreToVCPU(2000)).toBe(2)
      expect(milliCoreToVCPU(500)).toBe(0.5)
      expect(milliCoreToVCPU(0)).toBe(0)
    })
  })

  describe('formatNumber', () => {
    it('should format number to specified precision', () => {
      expect(formatNumber(1.23456)).toBe(1.23)
      expect(formatNumber(1.23456, 3)).toBe(1.235)
      expect(formatNumber(1.23456, 0)).toBe(1)
    })

    it('should handle whole numbers', () => {
      expect(formatNumber(5)).toBe(5)
      expect(formatNumber(5, 4)).toBe(5)
    })
  })
})

describe('calculateClusterResources', () => {
  const createMockNode = (
    cpuMilli: number,
    cpuUsage: number | null,
    memoryMib: number,
    memoryUsage: number | null,
    diskMib: number,
    diskUsage: number | null
  ): ClusterNodeDto =>
    ({
      resources_allocatable: {
        cpu_milli: cpuMilli,
        memory_mib: memoryMib,
        ephemeral_storage_mib: diskMib,
      },
      metrics_usage: {
        cpu_milli_usage: cpuUsage,
        memory_mib_working_set_usage: memoryUsage,
        disk_mib_usage: diskUsage,
      },
    }) as ClusterNodeDto

  it('should return proper object structure even with empty nodes', () => {
    const result = calculateClusterResources([])

    expect(result).toEqual({
      cpu: {
        used: 0,
        total: 0,
        percent: 0,
        unit: 'vCPU',
      },
      memory: {
        used: 0,
        total: 0,
        percent: 0,
        unit: 'GB',
      },
      disk: {
        used: 0,
        total: 0,
        percent: 0,
        unit: 'GB',
      },
    })
  })

  it('should return proper object structure with undefined nodes', () => {
    const result = calculateClusterResources(undefined)

    expect(result).toEqual({
      cpu: {
        used: 0,
        total: 0,
        percent: 0,
        unit: 'vCPU',
      },
      memory: {
        used: 0,
        total: 0,
        percent: 0,
        unit: 'GB',
      },
      disk: {
        used: 0,
        total: 0,
        percent: 0,
        unit: 'GB',
      },
    })
  })

  it('should calculate resources correctly for a single node', () => {
    const nodes = [createMockNode(2000, 1000, 2048, 1024, 4096, 2048)]

    const result = calculateClusterResources(nodes)

    expect(result.cpu.used).toBe(1)
    expect(result.cpu.total).toBe(2)
    expect(result.cpu.percent).toBe(50)

    expect(result.memory.used).toBe(1)
    expect(result.memory.total).toBe(2)
    expect(result.memory.percent).toBe(50)

    expect(result.disk.used).toBe(2)
    expect(result.disk.total).toBe(4)
    expect(result.disk.percent).toBe(50)
  })

  it('should calculate resources correctly for multiple nodes', () => {
    const nodes = [createMockNode(2000, 1000, 2048, 1024, 4096, 2048), createMockNode(2000, 500, 2048, 512, 4096, 1024)]

    const result = calculateClusterResources(nodes)

    // 1.5 / 4 vCPU = 37.5%
    expect(result.cpu.used).toBe(1.5)
    expect(result.cpu.total).toBe(4)
    expect(result.cpu.percent).toBe(37.5)

    // 1.5 / 4 GB = 37.5%
    expect(result.memory.used).toBe(1.5)
    expect(result.memory.total).toBe(4)
    expect(result.memory.percent).toBe(37.5)

    // 3 / 8 GB = 37.5%
    expect(result.disk.used).toBe(3)
    expect(result.disk.total).toBe(8)
    expect(result.disk.percent).toBe(37.5)
  })

  it('should handle null usage values', () => {
    const nodes = [createMockNode(2000, null, 2048, null, 4096, null), createMockNode(2000, 500, 2048, 512, 4096, 1024)]

    const result = calculateClusterResources(nodes)

    // 0.5 / 4 vCPU = 12.5%
    expect(result.cpu.used).toBe(0.5)
    expect(result.cpu.total).toBe(4)
    expect(result.cpu.percent).toBe(12.5)

    // 0.5 / 4 GB = 12.5%
    expect(result.memory.used).toBe(0.5)
    expect(result.memory.total).toBe(4)
    expect(result.memory.percent).toBe(12.5)

    // 1 / 8 GB = 12.5%
    expect(result.disk.used).toBe(1)
    expect(result.disk.total).toBe(8)
    expect(result.disk.percent).toBe(12.5)
  })

  it('should handle zero values correctly', () => {
    const nodes = [createMockNode(0, 0, 0, 0, 0, 0)]

    const result = calculateClusterResources(nodes)

    expect(result.cpu.used).toBe(0)
    expect(result.cpu.total).toBe(0)
    expect(result.cpu.percent).toBe(0)

    expect(result.memory.used).toBe(0)
    expect(result.memory.total).toBe(0)
    expect(result.memory.percent).toBe(0)

    expect(result.disk.used).toBe(0)
    expect(result.disk.total).toBe(0)
    expect(result.disk.percent).toBe(0)
  })

  it('should handle large numbers', () => {
    const nodes = [createMockNode(10000, 5000, 10240, 5120, 102400, 51200)]

    const result = calculateClusterResources(nodes)

    expect(result.cpu.used).toBe(5)
    expect(result.cpu.total).toBe(10)
    expect(result.cpu.percent).toBe(50)

    expect(result.memory.used).toBe(5)
    expect(result.memory.total).toBe(10)
    expect(result.memory.percent).toBe(50)

    expect(result.disk.used).toBe(50)
    expect(result.disk.total).toBe(100)
    expect(result.disk.percent).toBe(50)
  })
})
