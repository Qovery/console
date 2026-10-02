import { PlatformConfigurationApi } from 'qovery-typescript-axios'
import { platformConfiguration, platformConfigurationMutations } from './platform-configuration'

describe('platformConfiguration', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('gets the cluster platform configuration by cluster id', async () => {
    const configuration = {
      clusterId: 'cluster-123',
      organizationId: 'org-123',
      platform: { templateKey: 'qovery-cluster-v0', templateVersion: '0.1.0' },
      clusterInputs: {},
      layers: [],
    }
    const getClusterPlatformConfiguration = jest
      .spyOn(PlatformConfigurationApi.prototype, 'getClusterPlatformConfiguration')
      .mockResolvedValue({ data: configuration } as never)

    const query = platformConfiguration.clusterConfiguration({ clusterId: 'cluster-123' })

    await expect(query.queryFn({} as Parameters<typeof query.queryFn>[0])).resolves.toEqual(configuration)
    expect(getClusterPlatformConfiguration).toHaveBeenCalledWith('cluster-123')
  })

  it('returns null for a serialized 404 response', async () => {
    jest
      .spyOn(PlatformConfigurationApi.prototype, 'getClusterPlatformConfiguration')
      .mockRejectedValue({ response: { status: 404 } })

    const query = platformConfiguration.clusterConfiguration({ clusterId: 'cluster-123' })
    const result = await query.queryFn({} as Parameters<typeof query.queryFn>[0])

    expect(result).toBeNull()
  })

  it('keeps non-404 serialized errors', async () => {
    const error = { response: { status: 500 } }
    jest.spyOn(PlatformConfigurationApi.prototype, 'getClusterPlatformConfiguration').mockRejectedValue(error)

    const query = platformConfiguration.clusterConfiguration({ clusterId: 'cluster-123' })

    await expect(query.queryFn({} as Parameters<typeof query.queryFn>[0])).rejects.toBe(error)
  })

  it('resolves a component of an existing cluster by cluster id', async () => {
    const resolveClusterPlatformComponentConfiguration = jest
      .spyOn(PlatformConfigurationApi.prototype, 'resolveClusterPlatformComponentConfiguration')
      .mockResolvedValue({ data: {} } as never)
    const request = { profileConfig: { storage: 's3' }, clusterInputs: {}, componentOutputs: {} }

    const query = platformConfiguration.componentConfiguration({
      clusterId: 'cluster-123',
      componentKey: 'loki',
      request,
    })
    await query.queryFn({} as Parameters<typeof query.queryFn>[0])

    expect(resolveClusterPlatformComponentConfiguration).toHaveBeenCalledWith('cluster-123', 'loki', request)
  })

  it('replaces the cluster platform configuration with its cluster inputs', async () => {
    const updateClusterPlatformConfiguration = jest
      .spyOn(PlatformConfigurationApi.prototype, 'updateClusterPlatformConfiguration')
      .mockResolvedValue({ data: {} } as never)
    const request = {
      platform: { templateKey: 'qovery-cluster-v0', templateVersion: '0.1.0', layerSelections: {}, managedConfig: {} },
      clusterInputs: {},
    }

    await platformConfigurationMutations.updateClusterConfiguration({ clusterId: 'cluster-123', request })

    expect(updateClusterPlatformConfiguration).toHaveBeenCalledWith('cluster-123', request)
  })

  it('forwards the optional cluster context when listing templates', async () => {
    const listPlatformTemplates = jest
      .spyOn(PlatformConfigurationApi.prototype, 'listPlatformTemplates')
      .mockResolvedValue({ data: { results: [] } } as never)

    const query = platformConfiguration.templates({
      organizationId: 'org-123',
      clusterMode: 'CUSTOMER_MANAGED',
      cloudProvider: 'GCP',
    })

    await query.queryFn({} as Parameters<typeof query.queryFn>[0])

    expect(listPlatformTemplates).toHaveBeenCalledWith('org-123', 'CUSTOMER_MANAGED', 'GCP')
  })

  it('resolves a component before cluster creation with the explicit template and cluster context', async () => {
    const resolvePlatformTemplateComponentConfiguration = jest
      .spyOn(PlatformConfigurationApi.prototype, 'resolvePlatformTemplateComponentConfiguration')
      .mockResolvedValue({
        data: {
          componentKey: 'loki',
          fields: [],
          requirements: [],
          componentBindings: [],
          violations: [],
        },
      } as never)
    const request = {
      profileConfig: { storage: 'gcs' },
      clusterInputs: { 'infra.gcsBucketName': 'logs' },
      componentOutputs: {},
    }

    const query = platformConfiguration.templateComponentConfiguration({
      organizationId: 'org-123',
      templateKey: 'qovery-cluster-v0',
      templateVersion: '0.1.0',
      componentKey: 'loki',
      clusterMode: 'CUSTOMER_MANAGED',
      cloudProvider: 'GCP',
      request,
    })

    await query.queryFn({} as Parameters<typeof query.queryFn>[0])

    expect(resolvePlatformTemplateComponentConfiguration).toHaveBeenCalledWith(
      'org-123',
      'qovery-cluster-v0',
      '0.1.0',
      'loki',
      'CUSTOMER_MANAGED',
      'GCP',
      request
    )
  })
})
