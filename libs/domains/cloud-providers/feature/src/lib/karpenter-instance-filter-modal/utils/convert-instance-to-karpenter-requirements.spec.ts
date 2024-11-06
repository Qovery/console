import {
  type ClusterInstanceTypeResponseListResultsInner,
  type KarpenterNodePoolRequirement,
} from 'qovery-typescript-axios'
import { convertToKarpenterRequirements } from './convert-instance-to-karpenter-requirements'

describe('convertToKarpenterRequirements', () => {
  const createMockInstance = (
    architecture?: string,
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

  it('should create requirements from single instance with all attributes', () => {
    const instances = [createMockInstance('AMD64', 't3', 'small')]

    const expectedRequirements: KarpenterNodePoolRequirement[] = [
      {
        key: 'InstanceSize',
        operator: 'In',
        values: ['small'],
      },
      {
        key: 'Arch',
        operator: 'In',
        values: ['AMD64'],
      },
      {
        key: 'InstanceFamily',
        operator: 'In',
        values: ['t3'],
      },
    ]

    expect(convertToKarpenterRequirements(instances)).toEqual(expectedRequirements)
  })

  it('should deduplicate values from multiple instances', () => {
    const instances = [
      createMockInstance('AMD64', 't3', 'small'),
      createMockInstance('AMD64', 't3', 'medium'),
      createMockInstance('AMD64', 't3', 'small'), // Duplicate
    ]

    const expectedRequirements: KarpenterNodePoolRequirement[] = [
      {
        key: 'InstanceSize',
        operator: 'In',
        values: ['small', 'medium'],
      },
      {
        key: 'Arch',
        operator: 'In',
        values: ['AMD64'],
      },
      {
        key: 'InstanceFamily',
        operator: 'In',
        values: ['t3'],
      },
    ]

    const result = convertToKarpenterRequirements(instances)
    expect(result).toEqual(expectedRequirements)
  })
})
