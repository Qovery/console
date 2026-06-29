import { getKarpenterFeatureValue } from './karpenter-feature-value'

describe('getKarpenterFeatureValue', () => {
  it('returns the Karpenter value from value_object', () => {
    expect(
      getKarpenterFeatureValue({
        features: [
          {
            id: 'KARPENTER',
            value_object: {
              type: 'KARPENTER',
              value: {
                spot_enabled: true,
                disk_size_in_gib: 50,
                default_service_architecture: 'AMD64',
                qovery_node_pools: {
                  requirements: [{ key: 'Arch', values: ['AMD64', 'ARM64'] }],
                },
              },
            },
          },
        ],
      })
    ).toEqual({
      spot_enabled: true,
      disk_size_in_gib: 50,
      default_service_architecture: 'AMD64',
      qovery_node_pools: {
        requirements: [{ key: 'Arch', values: ['AMD64', 'ARM64'] }],
      },
    })
  })

  it('returns undefined when the feature value is not a Karpenter value object', () => {
    expect(
      getKarpenterFeatureValue({
        features: [
          {
            id: 'KARPENTER',
            value_object: {
              type: 'BOOLEAN',
              value: true,
            },
          },
        ],
      })
    ).toBeUndefined()
  })
})
