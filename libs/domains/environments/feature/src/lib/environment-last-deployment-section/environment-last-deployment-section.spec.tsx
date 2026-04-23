import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { EnvironmentLastDeploymentSection } from './environment-last-deployment-section'

const mockUseEnvironment = jest.fn()
const mockUseDeploymentHistory = jest.fn()
const mockUseServiceCount = jest.fn()
const mockDeployEnvironment = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1', projectId: 'proj-1', environmentId: 'env-1' }),
  useLinkProps: () => ({ href: '/environment/logs' }),
}))

jest.mock('../hooks/use-environment/use-environment', () => ({
  useEnvironment: () => mockUseEnvironment(),
}))

jest.mock('../hooks/use-deployment-history/use-deployment-history', () => ({
  useDeploymentHistory: () => mockUseDeploymentHistory(),
}))

jest.mock('../hooks/use-service-count/use-service-count', () => ({
  useServiceCount: () => mockUseServiceCount(),
}))

jest.mock('../hooks/use-deploy-environment/use-deploy-environment', () => ({
  useDeployEnvironment: () => ({
    mutate: mockDeployEnvironment,
  }),
}))

jest.mock('@qovery/shared/util-dates', () => ({
  ...jest.requireActual('@qovery/shared/util-dates'),
  dateUTCString: () => 'mocked-date',
  timeAgo: () => 'mocked-time',
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  Link: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => <a {...props}>{children}</a>,
}))

jest.mock('../environment-deployment-list/dropdown-services/dropdown-services', () => ({
  DropdownServices: () => <span>mock-dropdown-services</span>,
}))

const mockEnvironment = {
  id: 'env-1',
  name: 'my-env',
}

const baseDeployment = {
  identifier: {
    execution_id: 'exec-123',
  },
  status: 'DEPLOYED',
  action_status: 'SUCCESS',
  trigger_action: 'DEPLOY',
  total_duration: 'PT21M10S',
  stages: [
    {
      name: 'deploy',
      status: 'SUCCESS',
      services: [{ id: 'service-1' }],
    },
  ],
  auditing_data: {
    created_at: '2025-01-23T08:55:20.092474Z',
    updated_at: '2025-01-23T09:16:30.092474Z',
    origin: 'CONSOLE',
    triggered_by: 'John Doe',
  },
}

describe('EnvironmentLastDeploymentSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseEnvironment.mockReturnValue({
      data: mockEnvironment,
      isFetched: true,
    })
    mockUseServiceCount.mockReturnValue({
      data: 1,
      isFetched: true,
    })
  })

  it('renders the relative time for a finished deployment', () => {
    mockUseDeploymentHistory.mockReturnValue({
      data: [baseDeployment],
      isFetched: true,
    })

    renderWithProviders(<EnvironmentLastDeploymentSection />)

    expect(screen.getByText('mocked-time ago')).toBeInTheDocument()
    expect(screen.queryByText(/Running since/i)).not.toBeInTheDocument()
  })

  it('renders a live relative time for an ongoing deployment', () => {
    mockUseDeploymentHistory.mockReturnValue({
      data: [
        {
          ...baseDeployment,
          status: 'DEPLOYING',
          action_status: 'ONGOING',
        },
      ],
      isFetched: true,
    })

    renderWithProviders(<EnvironmentLastDeploymentSection />)

    expect(screen.getByText('mocked-time ago')).toBeInTheDocument()
  })

  it('renders the empty state when no deployment exists', () => {
    mockUseDeploymentHistory.mockReturnValue({
      data: [],
      isFetched: true,
    })

    renderWithProviders(<EnvironmentLastDeploymentSection />)

    const emptyState = screen.getByText('No deployment recorded yet').closest('.rounded-lg')

    expect(screen.getByText('No deployment recorded yet')).toBeInTheDocument()
    expect(emptyState).toHaveClass('px-4', 'py-4')
    expect(emptyState).not.toHaveClass('h-56')
    expect(screen.getByRole('button', { name: /deploy environment/i })).toBeInTheDocument()
  })

  it('does not render the deploy action when the environment has no services', () => {
    mockUseDeploymentHistory.mockReturnValue({
      data: [],
      isFetched: true,
    })
    mockUseServiceCount.mockReturnValue({
      data: 0,
      isFetched: true,
    })

    renderWithProviders(<EnvironmentLastDeploymentSection />)

    expect(screen.getByText('No deployment recorded yet')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /deploy environment/i })).not.toBeInTheDocument()
  })

  it('deploys the current environment from the empty state action', async () => {
    mockUseDeploymentHistory.mockReturnValue({
      data: [],
      isFetched: true,
    })

    const { userEvent } = renderWithProviders(<EnvironmentLastDeploymentSection />)

    await userEvent.click(screen.getByRole('button', { name: /deploy environment/i }))

    expect(mockDeployEnvironment).toHaveBeenCalledWith({
      environmentId: 'env-1',
    })
  })
})
