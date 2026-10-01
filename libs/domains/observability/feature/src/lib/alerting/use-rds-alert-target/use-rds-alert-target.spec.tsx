import { type AnyService } from '@qovery/domains/services/data-access'
import { renderHook } from '@qovery/shared/util-tests'
import { useRdsAlertTarget } from './use-rds-alert-target'

const mockUseEnvironment = jest.fn()
const mockUseCluster = jest.fn()
const mockUseBlueprint = jest.fn()
const mockGetRdsBlueprintEngine = jest.fn()
const mockUseBlueprintDbInstance = jest.fn()

jest.mock('../../hooks/use-environment/use-environment', () => ({
  useEnvironment: (params: unknown) => mockUseEnvironment(params),
}))
jest.mock('@qovery/domains/clusters/feature', () => ({
  useCluster: (params: unknown) => mockUseCluster(params),
}))
jest.mock('@qovery/domains/services/feature', () => ({
  useBlueprint: (params: unknown) => mockUseBlueprint(params),
  getRdsBlueprintEngine: (...params: unknown[]) => mockGetRdsBlueprintEngine(...params),
}))
jest.mock('../../database/database-rds-dashboard/util/use-blueprint-db-instance', () => ({
  useBlueprintDbInstance: (params: unknown) => mockUseBlueprintDbInstance(params),
}))

const blueprintService = {
  id: 'service-1',
  service_type: 'TERRAFORM',
  serviceType: 'TERRAFORM',
  blueprint_id: 'blueprint-1',
  environment: { id: 'env-1' },
} as unknown as AnyService

const awsCluster = {
  cloud_provider: 'AWS',
  metrics_parameters: { enabled: true, configuration: { cloud_watch_export_config: { enabled: true } } },
}

// React Query v4 reports `isLoading: true` for a disabled query, so the mocks mirror that.
const disabledQuery = { data: undefined, isLoading: true, isError: false }

describe('useRdsAlertTarget', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseEnvironment.mockReturnValue({ data: { cluster_id: 'cluster-1' }, isLoading: false, isError: false })
    mockUseCluster.mockReturnValue({ data: awsCluster, isLoading: false, isError: false })
    mockUseBlueprint.mockReturnValue({ data: { id: 'blueprint-1' }, isLoading: false, isError: false })
    mockGetRdsBlueprintEngine.mockReturnValue('postgresql')
    mockUseBlueprintDbInstance.mockReturnValue({ dbInstance: 'my-db', isLoading: false, isError: false })
  })

  it('resolves the Terraform target and instance of an RDS blueprint on AWS', () => {
    const { result } = renderHook(() => useRdsAlertTarget({ organizationId: 'org-1', service: blueprintService }))

    expect(result.current).toEqual({
      isRds: true,
      isResolving: false,
      isMetadataUnavailable: false,
      dbInstance: 'my-db',
      target: { target_id: 'service-1', target_type: 'TERRAFORM' },
      hasCloudWatchMetrics: true,
    })
  })

  it('ignores disabled queries for a service that is not a blueprint', () => {
    mockUseEnvironment.mockReturnValue(disabledQuery)
    mockUseCluster.mockReturnValue(disabledQuery)
    mockUseBlueprint.mockReturnValue(disabledQuery)
    mockUseBlueprintDbInstance.mockReturnValue({ dbInstance: undefined, isLoading: true, isError: false })
    const application = { id: 'app-1', service_type: 'APPLICATION', environment: { id: 'env-1' } } as AnyService

    const { result } = renderHook(() => useRdsAlertTarget({ organizationId: 'org-1', service: application }))

    expect(result.current).toMatchObject({ isRds: false, isResolving: false, isMetadataUnavailable: false })
    expect(mockUseEnvironment).toHaveBeenCalledWith({ environmentId: undefined })
  })

  it('does not load anything when disabled', () => {
    mockUseEnvironment.mockReturnValue(disabledQuery)
    mockUseCluster.mockReturnValue(disabledQuery)
    mockUseBlueprint.mockReturnValue(disabledQuery)

    const { result } = renderHook(() =>
      useRdsAlertTarget({ organizationId: 'org-1', service: blueprintService, enabled: false })
    )

    expect(result.current).toMatchObject({ isRds: false, isResolving: false, isMetadataUnavailable: false })
    expect(mockUseEnvironment).toHaveBeenCalledWith({ environmentId: undefined })
    expect(mockUseBlueprint).toHaveBeenCalledWith(expect.objectContaining({ blueprintId: '', enabled: false }))
  })

  it('is not an RDS target on another cloud provider', () => {
    mockUseCluster.mockReturnValue({ data: { cloud_provider: 'GCP' }, isLoading: false, isError: false })
    mockUseBlueprint.mockReturnValue(disabledQuery)

    const { result } = renderHook(() => useRdsAlertTarget({ organizationId: 'org-1', service: blueprintService }))

    expect(result.current).toMatchObject({ isRds: false, isResolving: false, isMetadataUnavailable: false })
    expect(mockUseBlueprint).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
  })

  it('stays resolving while the Terraform output loads', () => {
    mockUseBlueprintDbInstance.mockReturnValue({ dbInstance: undefined, isLoading: true, isError: false })

    const { result } = renderHook(() => useRdsAlertTarget({ organizationId: 'org-1', service: blueprintService }))

    expect(result.current).toMatchObject({ isRds: true, isResolving: true, dbInstance: undefined })
  })

  it('reports unavailable metadata when the Terraform output fails to load', () => {
    mockUseBlueprintDbInstance.mockReturnValue({ dbInstance: undefined, isLoading: false, isError: true })

    const { result } = renderHook(() => useRdsAlertTarget({ organizationId: 'org-1', service: blueprintService }))

    expect(result.current.isMetadataUnavailable).toBe(true)
  })

  it('reports disabled CloudWatch metrics', () => {
    mockUseCluster.mockReturnValue({
      data: { ...awsCluster, metrics_parameters: { enabled: true, configuration: {} } },
      isLoading: false,
      isError: false,
    })

    const { result } = renderHook(() => useRdsAlertTarget({ organizationId: 'org-1', service: blueprintService }))

    expect(result.current).toMatchObject({ isRds: true, hasCloudWatchMetrics: false })
  })
})
