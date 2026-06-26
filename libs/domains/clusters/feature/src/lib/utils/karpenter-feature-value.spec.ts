import { getKarpenterFeatureValue } from './karpenter-feature-value'

describe('getKarpenterFeatureValue', () => {
  it('returns the Karpenter value from value_object', () => {
    expect(
      getKarpenterFeatureValue({
        features: [
          {
            id: 'KARPENTER',
            value_object: {
              value: {
                qovery_node_pools: {
                  requirements: [{ key: 'Arch', values: ['AMD64', 'ARM64'] }],
                },
              },
            },
          },
        ],
      })
    ).toEqual({
      qovery_node_pools: {
        requirements: [{ key: 'Arch', values: ['AMD64', 'ARM64'] }],
      },
    })
  })

  it('returns the Karpenter value from the legacy value field', () => {
    expect(
      getKarpenterFeatureValue({
        features: [
          {
            id: 'KARPENTER',
            value: {
              qovery_node_pools: {
                gpu_override: true,
              },
            },
          },
        ],
      })
    ).toEqual({
      qovery_node_pools: {
        gpu_override: true,
      },
    })
  })

  it('returns undefined when the feature value does not match the Karpenter shape', () => {
    expect(
      getKarpenterFeatureValue({
        features: [
          {
            id: 'KARPENTER',
            value_object: {
              value: true,
            },
          },
        ],
      })
    ).toBeUndefined()
  })
})
