import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceLastDeployment } from './service-last-deployment'

const mockUseDeploymentHistory = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1', projectId: 'proj-1' }),
}))

jest.mock('../../hooks/use-deployment-history/use-deployment-history', () => ({
  useDeploymentHistory: (params: unknown) => mockUseDeploymentHistory(params),
}))

jest.mock('../../last-commit/last-commit', () => ({
  LastCommit: () => <span>mock-last-commit</span>,
}))

jest.mock('../../last-commit-author/last-commit-author', () => ({
  LastCommitAuthor: () => <span>mock-last-commit-author</span>,
}))

jest.mock('@qovery/shared/util-dates', () => ({
  ...jest.requireActual('@qovery/shared/util-dates'),
  dateUTCString: () => 'mocked-date',
  timeAgo: () => 'mocked-time-ago',
}))

const baseDeployment = {
  identifier: {
    execution_id: 'exec-123',
    service_id: 'service-123',
    service_type: 'APPLICATION',
    name: 'my-app',
  },
  auditing_data: {
    created_at: '2025-01-23T08:55:20.092474Z',
    updated_at: '2025-01-23T08:55:42.898794Z',
    origin: 'CONSOLE',
    triggered_by: 'John Doe',
  },
  status: 'SUCCESS',
  status_details: {
    action: 'DEPLOY',
    status: 'SUCCESS',
    sub_action: 'NONE',
  },
  details: {
    image_name: 'my-image',
    tag: 'v1.2.3',
  },
  icon_uri: 'app://qovery-console/application',
  total_duration: 'PT16.503S',
}

describe('ServiceLastDeployment', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders an empty state when no deployment exists', () => {
    mockUseDeploymentHistory.mockReturnValue({
      data: [],
      isFetched: true,
    })

    renderWithProviders(<ServiceLastDeployment serviceId="service-123" serviceType="APPLICATION" />)

    expect(screen.getByText('Application has never been deployed')).toBeInTheDocument()
    expect(screen.getByText('Deploy the application first')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /deploy now/i })).toBeInTheDocument()
  })

  it('renders the image tag version pill when deployment details contains an image tag', () => {
    mockUseDeploymentHistory.mockReturnValue({
      data: [baseDeployment],
      isFetched: true,
    })

    renderWithProviders(<ServiceLastDeployment serviceId="service-123" serviceType="APPLICATION" />)

    expect(screen.getByRole('button', { name: 'v1.2.3' })).toBeInTheDocument()
  })

  it('renders commit block when service has a git repository', () => {
    mockUseDeploymentHistory.mockReturnValue({
      data: [baseDeployment],
      isFetched: true,
    })

    const service = {
      id: 'service-123',
      name: 'my-app',
      serviceType: 'APPLICATION',
      environment: { id: 'env-1' },
      git_repository: {
        provider: 'GITHUB',
        owner: 'qovery',
        url: 'https://github.com/Qovery/console',
        name: 'Qovery/console',
        branch: 'main',
        root_path: '/',
      },
    }

    renderWithProviders(
      <ServiceLastDeployment serviceId="service-123" serviceType="APPLICATION" service={service as never} />
    )

    expect(screen.getByText('mock-last-commit')).toBeInTheDocument()
    expect(screen.getByText('mock-last-commit-author')).toBeInTheDocument()
  })
})
