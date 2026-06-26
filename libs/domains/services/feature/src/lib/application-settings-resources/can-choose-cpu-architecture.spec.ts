import { canChooseCpuArchitecture } from './can-choose-cpu-architecture'

const armSupportedCloudProviders = [
  {
    short_name: 'AWS',
    regions: [
      {
        name: 'eu-west-3',
        arm_supported: true,
      },
    ],
  },
  {
    short_name: 'GCP',
    regions: [
      {
        name: 'europe-west1',
        arm_supported: true,
      },
    ],
  },
]

describe('canChooseCpuArchitecture', () => {
  it.each(['AWS', 'GCP'])('allows %s services on deployed ARM-supported clusters', (cloudProvider) => {
    expect(
      canChooseCpuArchitecture({
        service: { serviceType: 'APPLICATION' },
        cluster: { cloud_provider: cloudProvider, region: cloudProvider === 'AWS' ? 'eu-west-3' : 'europe-west1' },
        cloudProviders: armSupportedCloudProviders,
        deploymentStatus: { state: 'DEPLOYED' },
      })
    ).toBe(true)
  })

  it('requires a settings service context', () => {
    expect(
      canChooseCpuArchitecture({
        cluster: { cloud_provider: 'AWS', region: 'eu-west-3' },
        cloudProviders: armSupportedCloudProviders,
        deploymentStatus: { state: 'DEPLOYED' },
      })
    ).toBe(false)
  })

  it('requires an AWS or GCP target cluster', () => {
    expect(
      canChooseCpuArchitecture({
        service: { serviceType: 'APPLICATION' },
        cluster: { cloud_provider: 'SCW', region: 'fr-par-1' },
        cloudProviders: [
          ...armSupportedCloudProviders,
          {
            short_name: 'SCW',
            regions: [{ name: 'fr-par-1', arm_supported: true }],
          },
        ],
        deploymentStatus: { state: 'DEPLOYED' },
      })
    ).toBe(false)
  })

  it('requires the target cluster region to support ARM workloads', () => {
    expect(
      canChooseCpuArchitecture({
        service: { serviceType: 'APPLICATION' },
        cluster: { cloud_provider: 'AWS', region: 'eu-west-1' },
        cloudProviders: [
          {
            short_name: 'AWS',
            regions: [{ name: 'eu-west-1', arm_supported: false }],
          },
        ],
        deploymentStatus: { state: 'DEPLOYED' },
      })
    ).toBe(false)
  })

  it.each(['APPLICATION', 'CONTAINER', 'JOB'])('allows %s services', (serviceType) => {
    expect(
      canChooseCpuArchitecture({
        service: { serviceType },
        cluster: { cloud_provider: 'AWS', region: 'eu-west-3' },
        cloudProviders: armSupportedCloudProviders,
        deploymentStatus: { state: 'DEPLOYED' },
      })
    ).toBe(true)
  })

  it.each(['DATABASE', 'HELM', 'TERRAFORM'])('does not allow %s services', (serviceType) => {
    expect(
      canChooseCpuArchitecture({
        service: { serviceType },
        cluster: { cloud_provider: 'AWS', region: 'eu-west-3' },
        cloudProviders: armSupportedCloudProviders,
        deploymentStatus: { state: 'DEPLOYED' },
      })
    ).toBe(false)
  })

  it('requires the service to have already been deployed', () => {
    expect(
      canChooseCpuArchitecture({
        service: { serviceType: 'APPLICATION' },
        cluster: { cloud_provider: 'AWS', region: 'eu-west-3' },
        cloudProviders: armSupportedCloudProviders,
        deploymentStatus: { state: 'READY' },
      })
    ).toBe(false)
  })
})
