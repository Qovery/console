import { useMatch, useParams } from 'react-router-dom'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { useProject } from '@qovery/domains/projects/feature'
import { useService } from '@qovery/domains/services/feature'
import { renderHook } from '@qovery/shared/util-tests'
import { useQoveryContext } from './use-qovery-context'

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useMatch: jest.fn(),
}))

jest.mock('@qovery/domains/clusters/feature', () => ({
  useCluster: jest.fn(),
}))

jest.mock('@qovery/domains/environments/feature', () => ({
  useEnvironment: jest.fn(),
}))

jest.mock('@qovery/domains/organizations/feature', () => ({
  useOrganization: jest.fn(),
}))

jest.mock('@qovery/domains/projects/feature', () => ({
  useProject: jest.fn(),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  useService: jest.fn(),
}))

describe('useQoveryContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useParams as jest.Mock).mockReturnValue({})
    ;(useMatch as jest.Mock).mockReturnValue(null)
    ;(useOrganization as jest.Mock).mockReturnValue({ data: undefined })
    ;(useProject as jest.Mock).mockReturnValue({ data: undefined })
    ;(useEnvironment as jest.Mock).mockReturnValue({ data: undefined })
    ;(useCluster as jest.Mock).mockReturnValue({ data: undefined })
    ;(useService as jest.Mock).mockReturnValue({ data: undefined })
  })

  it('should return context with organization when organizationId is provided', () => {
    const mockOrg = { id: 'org-123', name: 'Test Org' }
    ;(useParams as jest.Mock).mockReturnValue({ organizationId: 'org-123' })
    ;(useOrganization as jest.Mock).mockReturnValue({ data: mockOrg })

    const { result } = renderHook(() => useQoveryContext())

    expect(result.current.context.organization).toEqual(mockOrg)
    expect(result.current.current).toEqual({ ...mockOrg, type: 'organization' })
  })

  it('should return context with cluster when clusterId is provided', () => {
    const mockCluster = { id: 'cluster-123', name: 'Test Cluster' }
    ;(useParams as jest.Mock).mockReturnValue({ organizationId: 'org-123', clusterId: 'cluster-123' })
    ;(useCluster as jest.Mock).mockReturnValue({ data: mockCluster })

    const { result } = renderHook(() => useQoveryContext())

    expect(result.current.context.cluster).toEqual(mockCluster)
    expect(result.current.current).toEqual({ ...mockCluster, type: 'cluster' })
  })

  it('should return context with project when projectId is provided', () => {
    const mockProject = { id: 'project-123', name: 'Test Project' }
    ;(useParams as jest.Mock).mockReturnValue({
      organizationId: 'org-123',
      projectId: 'project-123',
    })
    ;(useProject as jest.Mock).mockReturnValue({ data: mockProject })

    const { result } = renderHook(() => useQoveryContext())

    expect(result.current.context.project).toEqual(mockProject)
    expect(result.current.current).toEqual({ ...mockProject, type: 'project' })
  })

  it('should return context with environment when environmentId is provided', () => {
    const mockEnvironment = { id: 'env-123', name: 'Test Environment', cluster_id: 'cluster-123' }
    ;(useParams as jest.Mock).mockReturnValue({
      organizationId: 'org-123',
      environmentId: 'env-123',
    })
    ;(useEnvironment as jest.Mock).mockReturnValue({ data: mockEnvironment })

    const { result } = renderHook(() => useQoveryContext())

    expect(result.current.context.environment).toEqual(mockEnvironment)
    expect(result.current.current).toEqual({ ...mockEnvironment, type: 'environment' })
  })

  it('should return context with service when applicationId is provided', () => {
    const mockService = { id: 'app-123', name: 'Test App' }
    ;(useParams as jest.Mock).mockReturnValue({
      organizationId: 'org-123',
      environmentId: 'env-123',
      applicationId: 'app-123',
    })
    ;(useService as jest.Mock).mockReturnValue({ data: mockService })

    const { result } = renderHook(() => useQoveryContext())

    expect(result.current.context.service).toEqual(mockService)
    expect(result.current.current).toEqual({ ...mockService, type: 'service' })
  })

  it('should prioritize service over environment in current', () => {
    const mockService = { id: 'app-123', name: 'Test App' }
    const mockEnvironment = { id: 'env-123', name: 'Test Environment', cluster_id: 'cluster-123' }
    ;(useParams as jest.Mock).mockReturnValue({
      organizationId: 'org-123',
      environmentId: 'env-123',
      applicationId: 'app-123',
    })
    ;(useService as jest.Mock).mockReturnValue({ data: mockService })
    ;(useEnvironment as jest.Mock).mockReturnValue({ data: mockEnvironment })

    const { result } = renderHook(() => useQoveryContext())

    expect(result.current.current).toEqual({ ...mockService, type: 'service' })
  })

  it('should return undefined current when no entities are available', () => {
    (useParams as jest.Mock).mockReturnValue({})

    const { result } = renderHook(() => useQoveryContext())

    expect(result.current.current).toBeUndefined()
    expect(result.current.context).toEqual({
      organization: undefined,
      cluster: undefined,
      project: undefined,
      environment: undefined,
      service: undefined,
      deployment: undefined,
    })
  })

  it('should include deployment info when on deployment logs page', () => {
    const mockService = { id: 'app-123', name: 'Test App' }
    ;(useParams as jest.Mock).mockReturnValue({
      organizationId: 'org-123',
      environmentId: 'env-123',
      applicationId: 'app-123',
    })
    ;(useService as jest.Mock).mockReturnValue({ data: mockService })
    ;(useMatch as jest.Mock).mockReturnValueOnce(null).mockReturnValueOnce({ params: { versionId: 'version-123' } })

    const { result } = renderHook(() => useQoveryContext())

    expect(result.current.context.deployment).toEqual({
      execution_id: 'version-123',
    })
  })
})
