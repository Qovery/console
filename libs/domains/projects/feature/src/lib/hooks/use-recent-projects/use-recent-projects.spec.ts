import { type Project } from 'qovery-typescript-axios'
import { useLocalStorage } from '@qovery/shared/util-hooks'
import { act, renderHook } from '@qovery/shared/util-tests'
import useRecentProjects from './use-recent-projects'

jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useLocalStorage: jest.fn(),
}))

type ProjectWithMetadata = Project & { timestamp?: number; organizationId?: string }

const useLocalStorageMock = useLocalStorage as jest.MockedFunction<typeof useLocalStorage>

const createProject = (id: string, name: string): ProjectWithMetadata => ({
  id,
  name,
  created_at: '2026-01-01T00:00:00.000Z',
  associated_environments_count: 1,
  organization: { id: 'organization-1' },
})

describe('useRecentProjects', () => {
  const organizationId = 'organization-1'

  beforeEach(() => {
    useLocalStorageMock.mockReturnValue([{}, jest.fn()])
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should return recent projects for the current organization', () => {
    const recentProjects: ProjectWithMetadata[] = [
      { ...createProject('project-1', 'Project 1'), timestamp: 100, organizationId },
    ]
    const mockStorage = {
      [organizationId]: recentProjects,
    }

    useLocalStorageMock.mockReturnValue([mockStorage, jest.fn()])

    const { result } = renderHook(() => useRecentProjects({ organizationId }))

    expect(result.current.getRecentProjects()).toEqual(recentProjects)
    expect(useLocalStorage).toHaveBeenCalledWith('qovery-recent-projects', {})
  })

  it('should add a project with metadata and keep only the last one', () => {
    const existingProject = { ...createProject('project-1', 'Project 1'), timestamp: 100, organizationId }
    const mockStorage = {
      [organizationId]: [existingProject],
    }
    const mockSetValue = jest.fn()
    const mockTimestamp = 1675209600000

    useLocalStorageMock.mockReturnValue([mockStorage, mockSetValue])
    jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp)

    const { result } = renderHook(() => useRecentProjects({ organizationId }))
    const newProject = createProject('project-2', 'Project 2')

    act(() => {
      result.current.addToRecentProjects(newProject)
    })

    expect(mockSetValue).toHaveBeenCalledWith({
      [organizationId]: [{ ...newProject, timestamp: mockTimestamp, organizationId }],
    })
  })

  it('should move an existing project to the top without duplicating it', () => {
    const project = { ...createProject('project-1', 'Project 1'), timestamp: 100, organizationId }
    const mockStorage = {
      [organizationId]: [project],
    }
    const mockSetValue = jest.fn()
    const mockTimestamp = 1675209600000

    useLocalStorageMock.mockReturnValue([mockStorage, mockSetValue])
    jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp)

    const { result } = renderHook(() => useRecentProjects({ organizationId }))

    act(() => {
      result.current.addToRecentProjects(project)
    })

    expect(mockSetValue).toHaveBeenCalledWith({
      [organizationId]: [{ ...project, timestamp: mockTimestamp, organizationId }],
    })
  })

  it('should clear recent projects for the current organization only', () => {
    const currentProject = { ...createProject('project-1', 'Project 1'), timestamp: 100, organizationId }
    const otherOrganizationProject = {
      ...createProject('project-2', 'Project 2'),
      timestamp: 90,
      organizationId: 'organization-2',
    }
    const mockStorage = {
      [organizationId]: [currentProject],
      'organization-2': [otherOrganizationProject],
    }
    const mockSetValue = jest.fn()

    useLocalStorageMock.mockReturnValue([mockStorage, mockSetValue])

    const { result } = renderHook(() => useRecentProjects({ organizationId }))

    act(() => {
      result.current.clearRecentProjects()
    })

    expect(mockSetValue).toHaveBeenCalledWith({
      [organizationId]: [],
      'organization-2': [otherOrganizationProject],
    })
  })
})
