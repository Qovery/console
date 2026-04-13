import { act } from '@testing-library/react'
import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceLastDeployment } from './service-last-deployment'

const mockUseDeploymentHistory = jest.fn()
const mockLastCommit = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1', projectId: 'proj-1' }),
}))

jest.mock('../../hooks/use-deployment-history/use-deployment-history', () => ({
  useDeploymentHistory: (params: unknown) => mockUseDeploymentHistory(params),
}))

jest.mock('../../last-commit/last-commit', () => ({
  LastCommit: (props: unknown) => {
    mockLastCommit(props)
    return <button type="button">mock-last-commit</button>
  },
}))

jest.mock('../../last-commit-author/last-commit-author', () => ({
  LastCommitAuthor: () => <span>mock-last-commit-author</span>,
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

const serviceWithGitRepository = {
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

    expect(screen.getByText('Service has never been deployed')).toBeInTheDocument()
    expect(screen.getByText('Deploy the service first')).toBeInTheDocument()
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

  it('prevents the deployment link navigation when clicking the version pill', () => {
    mockUseDeploymentHistory.mockReturnValue({
      data: [baseDeployment],
      isFetched: true,
    })

    renderWithProviders(<ServiceLastDeployment serviceId="service-123" serviceType="APPLICATION" />)

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true })

    act(() => {
      screen.getByRole('button', { name: 'v1.2.3' }).dispatchEvent(clickEvent)
    })

    expect(clickEvent.defaultPrevented).toBe(true)
  })

  it('renders commit block when service has a git repository', () => {
    mockUseDeploymentHistory.mockReturnValue({
      data: [baseDeployment],
      isFetched: true,
    })

    renderWithProviders(
      <ServiceLastDeployment
        serviceId="service-123"
        serviceType="APPLICATION"
        service={serviceWithGitRepository as never}
      />
    )

    expect(screen.getByText('mock-last-commit')).toBeInTheDocument()
    expect(screen.getByText('mock-last-commit-author')).toBeInTheDocument()
    expect(screen.getByText('mocked-time ago')).toBeInTheDocument()
    expect(screen.queryByText(/Running since/i)).not.toBeInTheDocument()
    expect(mockLastCommit).toHaveBeenCalledWith(expect.objectContaining({ showDeployFromAnotherVersionButton: false }))
  })

  it('prevents the deployment link navigation when clicking the last commit button', () => {
    mockUseDeploymentHistory.mockReturnValue({
      data: [baseDeployment],
      isFetched: true,
    })

    renderWithProviders(
      <ServiceLastDeployment
        serviceId="service-123"
        serviceType="APPLICATION"
        service={serviceWithGitRepository as never}
      />
    )

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true })

    act(() => {
      screen.getByRole('button', { name: 'mock-last-commit' }).dispatchEvent(clickEvent)
    })

    expect(clickEvent.defaultPrevented).toBe(true)
  })

  it('renders a running since label when the deployment is ongoing', () => {
    mockUseDeploymentHistory.mockReturnValue({
      data: [
        {
          ...baseDeployment,
          status_details: {
            ...baseDeployment.status_details,
            status: 'ONGOING',
          },
        },
      ],
      isFetched: true,
    })

    renderWithProviders(
      <ServiceLastDeployment
        serviceId="service-123"
        serviceType="APPLICATION"
        service={serviceWithGitRepository as never}
      />
    )

    expect(
      screen.getByText((_, element) => element?.textContent === 'Running since mocked-time ago')
    ).toBeInTheDocument()
  })

  it('renders the AI diagnostic panel only when the last deployment failed', () => {
    mockUseDeploymentHistory.mockReturnValue({
      data: [
        {
          ...baseDeployment,
          status: 'ERROR',
          status_details: {
            ...baseDeployment.status_details,
            status: 'ERROR',
          },
        },
      ],
      isFetched: true,
    })

    renderWithProviders(<ServiceLastDeployment serviceId="service-123" serviceType="APPLICATION" />)

    expect(
      screen.getByText('AI Copilot identified likely causes and fixes for this deployment error')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /launch diagnostic/i })).toBeInTheDocument()
  })
})
