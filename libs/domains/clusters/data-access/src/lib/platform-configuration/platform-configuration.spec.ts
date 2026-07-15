import { PlatformConfigurationApi } from 'qovery-typescript-axios'
import { platformConfiguration } from './platform-configuration'

describe('platformConfiguration', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns null for a serialized 404 response', async () => {
    jest
      .spyOn(PlatformConfigurationApi.prototype, 'getClusterPlatformBinding')
      .mockRejectedValue({ response: { status: 404 } })

    const query = platformConfiguration.binding({ organizationId: 'org-123', clusterId: 'cluster-123' })
    const result = await query.queryFn({} as Parameters<typeof query.queryFn>[0])

    expect(result).toBeNull()
  })

  it('keeps non-404 serialized errors', async () => {
    const error = { response: { status: 500 } }
    jest.spyOn(PlatformConfigurationApi.prototype, 'getClusterPlatformBinding').mockRejectedValue(error)

    const query = platformConfiguration.binding({ organizationId: 'org-123', clusterId: 'cluster-123' })

    await expect(query.queryFn({} as Parameters<typeof query.queryFn>[0])).rejects.toBe(error)
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
