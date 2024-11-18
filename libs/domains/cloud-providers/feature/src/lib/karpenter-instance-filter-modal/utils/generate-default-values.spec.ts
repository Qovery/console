import { type ClusterInstanceTypeResponseListResultsInner } from 'qovery-typescript-axios'
import { generateDefaultValues } from './generate-default-values'

describe('generateDefaultValues', () => {
  // Helper function to create mock instances
  const createMockInstance = (
    cpu: number,
    ram: number,
    architecture: string,
    instanceFamily?: string,
    instanceCategory?: string,
    instanceSize?: string
  ): ClusterInstanceTypeResponseListResultsInner =>
    ({
      cpu,
      ram_in_gb: ram,
      architecture,
      attributes: {
        instance_family: instanceFamily,
        instance_category: instanceCategory,
        instance_size: instanceSize,
      },
    }) as ClusterInstanceTypeResponseListResultsInner

  it('should handle empty instance array', () => {
    const result = generateDefaultValues([])
    expect(result).toEqual({
      ARM64: false,
      AMD64: false,
      categories: {},
      sizes: [],
    })
  })

  it('should correctly process single instance', () => {
    const instances = [createMockInstance(2, 4, 'AMD64', 't3', 'general_purpose', 'small')]

    const result = generateDefaultValues(instances)
    expect(result).toEqual({
      ARM64: false,
      AMD64: true,
      categories: {
        general_purpose: ['t3'],
      },
      sizes: ['small'],
    })
  })

  it('should handle multiple instances with different architectures', () => {
    const instances = [
      createMockInstance(2, 4, 'AMD64', 't3', 'general_purpose', 'small'),
      createMockInstance(4, 8, 'ARM64', 'c6g', 'compute', 'medium'),
      createMockInstance(8, 16, 'AMD64', 'm5', 'memory', 'large'),
    ]

    const result = generateDefaultValues(instances)
    expect(result).toEqual({
      ARM64: true,
      AMD64: true,
      categories: {
        general_purpose: ['t3'],
        compute: ['c6g'],
        memory: ['m5'],
      },
      sizes: ['small', 'medium', 'large'],
    })
  })

  it('should handle instances with same CPU or memory values', () => {
    const instances = [
      createMockInstance(4, 8, 'AMD64', 't3', 'general_purpose', 'medium'),
      createMockInstance(4, 8, 'ARM64', 't4g', 'general_purpose', 'medium'),
      createMockInstance(4, 16, 'AMD64', 'm5', 'memory', 'large'),
    ]

    const result = generateDefaultValues(instances)
    expect(result).toEqual({
      ARM64: true,
      AMD64: true,
      categories: {
        general_purpose: ['t3', 't4g'],
        memory: ['m5'],
      },
      sizes: ['medium', 'large'],
    })
  })
})
