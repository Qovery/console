import { type ClusterInstanceTypeResponseListResultsInner } from 'qovery-typescript-axios'
import { type KarpenterData } from '@qovery/shared/interfaces'
import { filterInstancesByKarpenterRequirements } from './filter-instances-by-karpenter-requirements'

describe('filterInstancesByKarpenterRequirements', () => {
  const createMockInstance = (
    architecture: string,
    instanceFamily?: string,
    instanceSize?: string
  ): ClusterInstanceTypeResponseListResultsInner =>
    ({
      architecture,
      attributes: {
        instance_family: instanceFamily,
        instance_size: instanceSize,
      },
    }) as ClusterInstanceTypeResponseListResultsInner

  const createKarpenterData = (requirements: Array<{ key: string; values: string[] }>) =>
    ({
      qovery_node_pools: {
        requirements,
      },
    }) as Omit<KarpenterData, 'disk_size_in_gib' | 'enabled' | 'spot_enabled'>

  it('should filter by instance size', () => {
    const instances = [
      createMockInstance('AMD64', 't3', 'small'),
      createMockInstance('ARM64', 'c6g', 'medium'),
      createMockInstance('AMD64', 'm5', 'large'),
    ]
    const karpenterData = createKarpenterData([{ key: 'InstanceSize', values: ['small', 'medium'] }])

    const result = filterInstancesByKarpenterRequirements(instances, karpenterData)
    expect(result).toHaveLength(2)
    expect(result.some((instance) => instance.attributes?.instance_size === 'small')).toBeTruthy()
    expect(result.some((instance) => instance.attributes?.instance_size === 'medium')).toBeTruthy()
    expect(result.some((instance) => instance.attributes?.instance_size === 'large')).toBeFalsy()
  })

  it('should filter by architecture', () => {
    const instances = [createMockInstance('AMD64', 't3', 'small'), createMockInstance('ARM64', 'c6g', 'medium')]
    const karpenterData = createKarpenterData([{ key: 'Arch', values: ['ARM64'] }])

    const result = filterInstancesByKarpenterRequirements(instances, karpenterData)
    expect(result).toHaveLength(1)
    expect(result[0].architecture).toBe('ARM64')
  })

  it('should filter by instance family', () => {
    const instances = [
      createMockInstance('AMD64', 't3', 'small'),
      createMockInstance('ARM64', 'c6g', 'medium'),
      createMockInstance('AMD64', 'm5', 'large'),
    ]
    const karpenterData = createKarpenterData([{ key: 'InstanceFamily', values: ['t3', 'm5'] }])

    const result = filterInstancesByKarpenterRequirements(instances, karpenterData)
    expect(result).toHaveLength(2)
    // Verify that each expected family is present in the results
    expect(result.some((instance) => instance.attributes?.instance_family === 't3')).toBeTruthy()
    expect(result.some((instance) => instance.attributes?.instance_family === 'm5')).toBeTruthy()
    // Verify that c6g family is not present
    expect(result.some((instance) => instance.attributes?.instance_family === 'c6g')).toBeFalsy()
  })

  it('should handle multiple requirements', () => {
    const instances = [
      createMockInstance('AMD64', 't3', 'small'),
      createMockInstance('ARM64', 'c6g', 'medium'),
      createMockInstance('AMD64', 'm5', 'large'),
      createMockInstance('ARM64', 't3', 'small'),
    ]
    const karpenterData = createKarpenterData([
      { key: 'Arch', values: ['ARM64'] },
      { key: 'InstanceFamily', values: ['t3'] },
      { key: 'InstanceSize', values: ['small'] },
    ])

    const result = filterInstancesByKarpenterRequirements(instances, karpenterData)
    expect(result).toHaveLength(1)
    const matchedInstance = result[0]
    expect(matchedInstance.architecture).toBe('ARM64')
    expect(matchedInstance.attributes?.instance_family).toBe('t3')
    expect(matchedInstance.attributes?.instance_size).toBe('small')
  })
})
