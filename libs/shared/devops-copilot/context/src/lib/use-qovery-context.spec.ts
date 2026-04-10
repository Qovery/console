import { useQuery } from '@tanstack/react-query'
import { renderHook } from '@qovery/shared/util-tests'
import { useQoveryContext } from './use-qovery-context'

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}))

describe('useQoveryContext', () => {
  const useQueryMock = useQuery as jest.Mock

  const setPathname = (pathname: string) => {
    window.history.replaceState({}, '', pathname)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    setPathname('/')
    useQueryMock.mockReturnValue({ data: undefined })
  })

  it('should return context with organization when organizationId is provided', () => {
    const mockOrg = { id: 'org-123', name: 'Test Org' }
    setPathname('/organization/org-123/overview')
    useQueryMock.mockReturnValueOnce({ data: mockOrg })

    const { result } = renderHook(() => useQoveryContext())

    expect(result.current.context.organization).toEqual(mockOrg)
    expect(result.current.current).toEqual({ ...mockOrg, type: 'organization' })
  })

  it('should return context with cluster when clusterId is provided', () => {
    const mockCluster = { id: 'cluster-123', name: 'Test Cluster' }
    setPathname('/organization/org-123/cluster/cluster-123/overview')
    useQueryMock
      .mockReturnValueOnce({ data: undefined })
      .mockReturnValueOnce({ data: undefined })
      .mockReturnValueOnce({ data: undefined })
      .mockReturnValueOnce({ data: mockCluster })

    const { result } = renderHook(() => useQoveryContext())

    expect(result.current.context.cluster).toEqual(mockCluster)
    expect(result.current.current).toEqual({ ...mockCluster, type: 'cluster' })
  })

  it('should return context with project when projectId is provided', () => {
    const mockProject = { id: 'project-123', name: 'Test Project' }
    setPathname('/organization/org-123/project/project-123/overview')
    useQueryMock.mockReturnValueOnce({ data: undefined }).mockReturnValueOnce({ data: mockProject })

    const { result } = renderHook(() => useQoveryContext())

    expect(result.current.context.project).toEqual(mockProject)
    expect(result.current.current).toEqual({ ...mockProject, type: 'project' })
  })

  it('should return context with environment when environmentId is provided', () => {
    const mockEnvironment = { id: 'env-123', name: 'Test Environment', cluster_id: 'cluster-123' }
    setPathname('/organization/org-123/project/project-123/environment/env-123/overview')
    useQueryMock
      .mockReturnValueOnce({ data: undefined })
      .mockReturnValueOnce({ data: undefined })
      .mockReturnValueOnce({ data: mockEnvironment })

    const { result } = renderHook(() => useQoveryContext())

    expect(result.current.context.environment).toEqual(mockEnvironment)
    expect(result.current.current).toEqual({ ...mockEnvironment, type: 'environment' })
  })

  it('should return context with service when applicationId is provided', () => {
    const mockService = { id: 'app-123', name: 'Test App' }
    setPathname('/organization/org-123/project/project-123/environment/env-123/application/app-123/general')
    useQueryMock
      .mockReturnValueOnce({ data: undefined })
      .mockReturnValueOnce({ data: undefined })
      .mockReturnValueOnce({ data: undefined })
      .mockReturnValueOnce({ data: undefined })
      .mockReturnValueOnce({ data: mockService })

    const { result } = renderHook(() => useQoveryContext())

    expect(result.current.context.service).toEqual(mockService)
    expect(result.current.current).toEqual({ ...mockService, type: 'service' })
  })

  it('should prioritize service over environment in current', () => {
    const mockService = { id: 'app-123', name: 'Test App' }
    const mockEnvironment = { id: 'env-123', name: 'Test Environment', cluster_id: 'cluster-123' }
    setPathname('/organization/org-123/project/project-123/environment/env-123/service/app-123/overview')
    useQueryMock
      .mockReturnValueOnce({ data: undefined })
      .mockReturnValueOnce({ data: undefined })
      .mockReturnValueOnce({ data: mockEnvironment })
      .mockReturnValueOnce({ data: undefined })
      .mockReturnValueOnce({ data: mockService })

    const { result } = renderHook(() => useQoveryContext())

    expect(result.current.current).toEqual({ ...mockService, type: 'service' })
  })

  it('should return undefined current when no entities are available', () => {
    setPathname('/')

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
    setPathname(
      '/organization/org-123/project/project-123/environment/env-123/service/app-123/deployments/logs/version-123'
    )
    useQueryMock
      .mockReturnValueOnce({ data: undefined })
      .mockReturnValueOnce({ data: undefined })
      .mockReturnValueOnce({ data: undefined })
      .mockReturnValueOnce({ data: undefined })
      .mockReturnValueOnce({ data: mockService })

    const { result } = renderHook(() => useQoveryContext())

    expect(result.current.context.deployment).toEqual({
      execution_id: 'version-123',
    })
  })
})
