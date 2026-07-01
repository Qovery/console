import { canChooseCpuArchitecture } from './can-choose-cpu-architecture'

function createCluster({
  cloudProvider = 'AWS',
  region = 'us-east-1',
  architectures = ['AMD64', 'ARM64'],
}: {
  cloudProvider?: string
  region?: string
  architectures?: string[]
} = {}) {
  return {
    cloud_provider: cloudProvider,
    region,
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

function createCloudProviders({ gcpArmSupported = true }: { gcpArmSupported?: boolean } = {}) {
  return [
    {
      short_name: 'GCP',
      regions: [{ name: 'europe-west9', arm_supported: gcpArmSupported }],
    },
  ]
}

describe('canChooseCpuArchitecture', () => {
  it('allows AWS services when Karpenter supports multiple architectures', () => {
    expect(
      canChooseCpuArchitecture({
        serviceType: 'APPLICATION',
        cluster: createCluster({ cloudProvider: 'AWS' }),
      })
    ).toBe(true)
  })

  it('allows GCP services when the cluster region supports ARM', () => {
    expect(
      canChooseCpuArchitecture({
        serviceType: 'APPLICATION',
        cluster: createCluster({ cloudProvider: 'GCP', region: 'europe-west9', architectures: [] }),
        cloudProviders: createCloudProviders({ gcpArmSupported: true }),
      })
    ).toBe(true)
  })

  it('does not allow AWS services when Karpenter supports a single architecture', () => {
    expect(
      canChooseCpuArchitecture({
        serviceType: 'APPLICATION',
        cluster: createCluster({ cloudProvider: 'AWS', architectures: ['AMD64'] }),
      })
    ).toBe(false)
  })

  it('does not allow GCP services when the cluster region does not support ARM', () => {
    expect(
      canChooseCpuArchitecture({
        serviceType: 'APPLICATION',
        cluster: createCluster({ cloudProvider: 'GCP', region: 'europe-west9', architectures: ['AMD64', 'ARM64'] }),
        cloudProviders: createCloudProviders({ gcpArmSupported: false }),
      })
    ).toBe(false)
  })

  it('does not allow GCP services when the cluster region cannot be resolved', () => {
    expect(
      canChooseCpuArchitecture({
        serviceType: 'APPLICATION',
        cluster: createCluster({ cloudProvider: 'GCP', region: 'us-east1', architectures: ['AMD64', 'ARM64'] }),
        cloudProviders: createCloudProviders({ gcpArmSupported: true }),
      })
    ).toBe(false)
  })

  it('allows creation flow without an existing service', () => {
    expect(
      canChooseCpuArchitecture({
        cluster: createCluster({ cloudProvider: 'AWS' }),
      })
    ).toBe(true)
  })

  it('requires an AWS or GCP target cluster', () => {
    expect(
      canChooseCpuArchitecture({
        serviceType: 'APPLICATION',
        cluster: createCluster({ cloudProvider: 'SCW' }),
      })
    ).toBe(false)
  })

  it('requires Karpenter to support multiple architectures for AWS clusters', () => {
    expect(
      canChooseCpuArchitecture({
        serviceType: 'APPLICATION',
        cluster: createCluster({ cloudProvider: 'AWS', architectures: [] }),
      })
    ).toBe(false)
  })

  it('requires a Karpenter architecture requirement for AWS clusters', () => {
    expect(
      canChooseCpuArchitecture({
        serviceType: 'APPLICATION',
        cluster: {
          cloud_provider: 'AWS',
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
        serviceType,
        cluster: createCluster(),
      })
    ).toBe(true)
  })

  it.each(['DATABASE', 'HELM', 'TERRAFORM'])('does not allow %s services', (serviceType) => {
    expect(
      canChooseCpuArchitecture({
        serviceType,
        cluster: createCluster(),
      })
    ).toBe(false)
  })
})
