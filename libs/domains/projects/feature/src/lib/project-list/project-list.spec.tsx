import type { ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useFavoriteProjectsHook from '../hooks/use-favorite-projects/use-favorite-projects'
import * as useProjectsHook from '../hooks/use-projects/use-projects'
import ProjectList from './project-list'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'test-org-id' }),
  Link: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => <a {...props}>{children}</a>,
}))

const useProjectsMockSpy = jest.spyOn(useProjectsHook, 'useProjects') as jest.Mock
const useFavoriteProjectsMockSpy = jest.spyOn(useFavoriteProjectsHook, 'useFavoriteProjects') as jest.Mock

describe('ProjectList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useFavoriteProjectsMockSpy.mockReturnValue({
      isProjectFavorite: jest.fn(() => false),
      toggleFavoriteProject: jest.fn(),
    })
  })

  it('should render empty state when no project is returned', () => {
    useProjectsMockSpy.mockReturnValue({
      data: [],
      isFetched: true,
    })

    renderWithProviders(<ProjectList />)
    expect(screen.getByText('No projects created yet')).toBeInTheDocument()
  })

  it('should render empty state with buttons when no projects', () => {
    useProjectsMockSpy.mockReturnValue({
      data: [],
      isFetched: true,
    })

    renderWithProviders(<ProjectList />)

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

    renderWithProviders(<ProjectList />)

    expect(screen.getByText('Your projects')).toBeInTheDocument()
    expect(screen.getByText('Project 1')).toBeInTheDocument()
    expect(screen.getByText('Project 2')).toBeInTheDocument()
    expect(screen.getByText('1 environment')).toBeInTheDocument()
    expect(screen.getByText('3 environments')).toBeInTheDocument()
    expect(screen.getByText('New project')).toBeInTheDocument()
  })

  it('should render favorite buttons with the right labels', () => {
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

    useFavoriteProjectsMockSpy.mockReturnValue({
      isProjectFavorite: jest.fn((projectId: string) => projectId === '2'),
      toggleFavoriteProject: jest.fn(),
    })

    renderWithProviders(<ProjectList />)

    expect(screen.getByRole('button', { name: 'Add Project 1 to favorites' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Project 2 from favorites' })).toBeInTheDocument()
  })

  it('should display favorite projects before non favorite projects', () => {
    const projects = [
      {
        id: '2',
        name: 'Project B',
        associated_environments_count: 1,
      },
      {
        id: '1',
        name: 'Project A',
        associated_environments_count: 2,
      },
      {
        id: '3',
        name: 'Project C',
        associated_environments_count: 3,
      },
    ]

    useProjectsMockSpy.mockReturnValue({
      data: projects,
      isFetched: true,
    })

    useFavoriteProjectsMockSpy.mockReturnValue({
      isProjectFavorite: jest.fn((projectId: string) => projectId === '3'),
      toggleFavoriteProject: jest.fn(),
    })

    renderWithProviders(<ProjectList />)

    expect(screen.getAllByLabelText(/open project/i).map((link) => link.getAttribute('aria-label'))).toEqual([
      'Open project Project C',
      'Open project Project A',
      'Open project Project B',
    ])
  })

  it('should keep alphabetical order within favorites and non favorite groups', () => {
    const projects = [
      {
        id: '4',
        name: 'Zeta',
        associated_environments_count: 1,
      },
      {
        id: '3',
        name: 'Beta',
        associated_environments_count: 2,
      },
      {
        id: '2',
        name: 'Omega',
        associated_environments_count: 3,
      },
      {
        id: '1',
        name: 'Alpha',
        associated_environments_count: 4,
      },
    ]

    useProjectsMockSpy.mockReturnValue({
      data: projects,
      isFetched: true,
    })

    useFavoriteProjectsMockSpy.mockReturnValue({
      isProjectFavorite: jest.fn((projectId: string) => ['3', '4'].includes(projectId)),
      toggleFavoriteProject: jest.fn(),
    })

    renderWithProviders(<ProjectList />)

    expect(screen.getAllByLabelText(/open project/i).map((link) => link.getAttribute('aria-label'))).toEqual([
      'Open project Beta',
      'Open project Zeta',
      'Open project Alpha',
      'Open project Omega',
    ])
  })

  it('should toggle favorite when clicking the favorite button', async () => {
    const projects = [
      {
        id: '1',
        name: 'Project 1',
        associated_environments_count: 1,
      },
    ]

    const toggleFavoriteProject = jest.fn()

    useProjectsMockSpy.mockReturnValue({
      data: projects,
      isFetched: true,
    })

    useFavoriteProjectsMockSpy.mockReturnValue({
      isProjectFavorite: jest.fn(() => false),
      toggleFavoriteProject,
    })

    const { userEvent } = renderWithProviders(<ProjectList />)

    await userEvent.click(screen.getByRole('button', { name: 'Add Project 1 to favorites' }))

    expect(toggleFavoriteProject).toHaveBeenCalledWith(projects[0])
  })
})
