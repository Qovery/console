import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useProjectsHook from '../hooks/use-projects/use-projects'
import ProjectList from './project-list'

const useProjectsMockSpy = jest.spyOn(useProjectsHook, 'useProjects') as jest.Mock

describe('ProjectList', () => {
  const organizationId = 'test-org-id'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return null when data is not fetched', () => {
    useProjectsMockSpy.mockReturnValue({
      data: [],
      isFetched: false,
    })

    const { container } = renderWithProviders(<ProjectList organizationId={organizationId} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('should render empty state with buttons when no projects', () => {
    useProjectsMockSpy.mockReturnValue({
      data: [],
      isFetched: true,
    })

    renderWithProviders(<ProjectList organizationId={organizationId} />)

    expect(screen.getByText('No projects created yet')).toBeInTheDocument()
    expect(screen.getByText('Create your first project and environments to start deploying apps')).toBeInTheDocument()
    expect(screen.getByText('Create project')).toBeInTheDocument()
    expect(screen.getByText('New project')).toBeInTheDocument()
  })

  it('should render projects list with correct pluralization', () => {
    const projects = [
      {
        id: '1',
        name: 'Project 1',
        associated_environments_count: 1,
      },
      {
        id: '2',
        name: 'Project 2',
        associated_environments_count: 3,
      },
    ]

    useProjectsMockSpy.mockReturnValue({
      data: projects,
      isFetched: true,
    })

    renderWithProviders(<ProjectList organizationId={organizationId} />)

    expect(screen.getByText('Your projects')).toBeInTheDocument()
    expect(screen.getByText('Project 1')).toBeInTheDocument()
    expect(screen.getByText('Project 2')).toBeInTheDocument()
    expect(screen.getByText('1 environment')).toBeInTheDocument()
    expect(screen.getByText('3 environments')).toBeInTheDocument()
    expect(screen.getByText('New project')).toBeInTheDocument()
  })
})
