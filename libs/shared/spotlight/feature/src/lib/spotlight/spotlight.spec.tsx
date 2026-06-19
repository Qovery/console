import { useNavigate } from '@tanstack/react-router'
import { type Project } from 'qovery-typescript-axios'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { Spotlight } from './spotlight'

const navigateMock = jest.fn()
const mockAddToRecentProjects = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: jest.fn(),
  useMatchRoute: () => () => undefined,
}))

jest.mock('@qovery/domains/projects/feature', () => ({
  ...jest.requireActual('@qovery/domains/projects/feature'),
  useProjects: () => ({
    data: [
      {
        id: 'project-1',
        name: 'Billing API',
        created_at: '2026-01-01T00:00:00.000Z',
        associated_environments_count: 1,
        organization: { id: 'organization-1' },
      },
      {
        id: 'project-2',
        name: 'Frontend',
        created_at: '2026-01-01T00:00:00.000Z',
        associated_environments_count: 1,
        organization: { id: 'organization-1' },
      },
    ] satisfies Project[],
    isLoading: false,
  }),
  useRecentProjects: () => ({
    getRecentProjects: () =>
      [
        {
          id: 'project-2',
          name: 'Frontend',
          created_at: '2026-01-01T00:00:00.000Z',
          associated_environments_count: 1,
          organization: { id: 'organization-1' },
        },
      ] satisfies Project[],
    addToRecentProjects: mockAddToRecentProjects,
  }),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  ...jest.requireActual('@qovery/domains/services/feature'),
  useFavoriteServices: () => ({
    getFavoriteServices: () => [],
  }),
  useRecentServices: () => ({
    getRecentServices: () => [],
    addToRecentServices: jest.fn(),
  }),
}))

jest.mock('../hooks/use-services-search/use-services-search', () => ({
  useServicesSearch: () => ({
    data: [],
    isLoading: false,
  }),
}))

describe('Spotlight', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useNavigate as jest.Mock).mockReturnValue(navigateMock)
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<Spotlight organizationId="000" open={true} />)
    expect(baseElement).toBeTruthy()

    expect(baseElement).toHaveTextContent('Search')
    expect(baseElement).toHaveTextContent('Settings')
    expect(baseElement).toHaveTextContent('View my container registries')
    expect(baseElement).toHaveTextContent('View my helm repositories')
    expect(baseElement).toHaveTextContent('View my git tokens')
    expect(baseElement).toHaveTextContent('View my webhooks')
    expect(baseElement).toHaveTextContent('View my API tokens')
    expect(baseElement).toHaveTextContent('View my team members')
    expect(baseElement).toHaveTextContent('Go to personal settings')
    expect(baseElement).toHaveTextContent('Help')
    expect(baseElement).toHaveTextContent('Go to documentation')
    expect(baseElement).toHaveTextContent('Roadmap')
    expect(baseElement).toHaveTextContent('Get help')
    expect(baseElement).toHaveTextContent('Arrow to navigate')
    expect(baseElement).toHaveTextContent('Enter to open')
    expect(baseElement).toHaveTextContent('Last project opened')
    expect(baseElement.querySelectorAll('[data-value^="project-"]')).toHaveLength(1)
  })

  it('should search and navigate to projects', async () => {
    const { baseElement, userEvent } = renderWithProviders(<Spotlight organizationId="organization-1" open={true} />)

    await userEvent.type(baseElement.querySelector('input') as HTMLInputElement, 'billing')
    expect(baseElement).toHaveTextContent('Projects')
    expect(baseElement).toHaveTextContent('Billing API')
    expect(baseElement).not.toHaveTextContent('Frontend')

    await userEvent.click(
      baseElement.querySelector('[cmdk-item][data-value="project-Billing API-#project-1"]') as Element
    )

    expect(mockAddToRecentProjects).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'project-1',
      })
    )
    expect(navigateMock).toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId',
      params: {
        organizationId: 'organization-1',
        projectId: 'project-1',
      },
    })
  })
})
