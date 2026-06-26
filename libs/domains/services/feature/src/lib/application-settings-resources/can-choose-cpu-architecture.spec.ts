import { canChooseCpuArchitecture } from './can-choose-cpu-architecture'

function createCluster({
  cloudProvider = 'AWS',
  architectures = ['AMD64', 'ARM64'],
}: {
  cloudProvider?: string
  architectures?: string[]
} = {}) {
  return {
    cloud_provider: cloudProvider,
    features: [
      {
        id: 'KARPENTER',
        value_object: {
          value: {
            qovery_node_pools: {
              requirements: [
                {
                  key: 'Arch',
                  values: architectures,
                },
              ],
            },
          },
        },
      },
    ],
  }
}

describe('canChooseCpuArchitecture', () => {
  it.each(['AWS', 'GCP'])('allows %s services when Karpenter supports multiple architectures', (cloudProvider) => {
    expect(
      canChooseCpuArchitecture({
        service: { serviceType: 'APPLICATION' },
        cluster: createCluster({ cloudProvider }),
      })
    ).toBe(true)
  })

  it('does not allow services when Karpenter supports a single architecture', () => {
    expect(
      canChooseCpuArchitecture({
        service: { serviceType: 'APPLICATION' },
        cluster: createCluster({ architectures: ['AMD64'] }),
      })
    ).toBe(false)
  })

  it('allows creation flow without an existing service', () => {
    expect(
      canChooseCpuArchitecture({
        cluster: createCluster(),
      })
    ).toBe(true)
  })

  it('requires an AWS or GCP target cluster', () => {
    expect(
      canChooseCpuArchitecture({
        service: { serviceType: 'APPLICATION' },
        cluster: createCluster({ cloudProvider: 'SCW' }),
      })
    ).toBe(false)
  })

  it('requires Karpenter to support multiple architectures', () => {
    expect(
      canChooseCpuArchitecture({
        service: { serviceType: 'APPLICATION' },
        cluster: createCluster({ architectures: [] }),
      })
    ).toBe(false)
  })

  it('requires a Karpenter architecture requirement', () => {
    expect(
      canChooseCpuArchitecture({
        service: { serviceType: 'APPLICATION' },
        cluster: {
          cloud_provider: 'AWS',
          features: [
            {
              id: 'KARPENTER',
              value_object: {
                value: {
                  qovery_node_pools: {
                    requirements: [],
                  },
                },
              },
            },
          ],
        },
      })
    ).toBe(false)
  })

  it.each(['APPLICATION', 'CONTAINER', 'JOB'])('allows %s services', (serviceType) => {
    expect(
      canChooseCpuArchitecture({
        service: { serviceType },
        cluster: createCluster(),
      })
    ).toBe(true)
  })

  it.each(['DATABASE', 'HELM', 'TERRAFORM'])('does not allow %s services', (serviceType) => {
    expect(
      canChooseCpuArchitecture({
        service: { serviceType },
        cluster: createCluster(),
      })
    ).toBe(false)
  })
})
