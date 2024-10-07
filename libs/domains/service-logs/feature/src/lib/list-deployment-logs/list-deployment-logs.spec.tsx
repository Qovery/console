import { type Status } from 'qovery-typescript-axios'
import { useDeploymentStatus, useLinks, useService } from '@qovery/domains/services/feature'
import { environmentFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { useDeploymentLogs } from '../hooks/use-deployment-logs/use-deployment-logs'
import { ListDeploymentLogs } from './list-deployment-logs'

window.HTMLElement.prototype.scroll = jest.fn()

jest.mock('../hooks/use-deployment-logs/use-deployment-logs')
jest.mock('@qovery/domains/services/feature')

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    organizationId: '0',
    projectId: '1',
    environmentId: '2',
    serviceId: '3',
    versionId: '4',
  }),
}))

describe('ListDeploymentLogs', () => {
  const mockEnvironment = environmentFactoryMock(1)[0]

  const mockDeploymentHistoryEnvironment = [{ id: '4', created_at: '2023-01-01T00:00:00Z' }]

  const mockServiceStatus: Status = {
    id: '111',
    state: 'DELETE_ERROR',
    service_deployment_status: 'UP_TO_DATE',
    last_deployment_date: '2024-09-18T07:03:29.819774Z',
    is_part_last_deployment: true,
    steps: {
      total_duration_sec: 69,
      total_computing_duration_sec: 64,
      details: [
        {
          step_name: 'BUILD_QUEUEING',
          status: 'SUCCESS',
          duration_sec: 0,
        },
        {
          step_name: 'REGISTRY_CREATE_REPOSITORY',
          status: 'SUCCESS',
          duration_sec: 10,
        },
        {
          step_name: 'GIT_CLONE',
          status: 'SUCCESS',
          duration_sec: 1,
        },
        {
          step_name: 'BUILD',
          status: 'SUCCESS',
          duration_sec: 24,
        },
        {
          step_name: 'DEPLOYMENT_QUEUEING',
          status: 'SUCCESS',
          duration_sec: 0,
        },
        {
          step_name: 'DEPLOYMENT',
          status: 'ERROR',
          duration_sec: 29,
        },
      ],
    },
  }

  const mockLogs = [
    {
      id: '1',
      timestamp: '2023-01-01T00:00:00Z',
      message: { safe_message: 'Log 1' },
      details: { stage: { step: 'BUILD' } },
    },
    {
      id: '2',
      timestamp: '2023-01-01T00:01:00Z',
      message: { safe_message: 'Log 2' },
      details: { stage: { step: 'DEPLOY' } },
    },
  ]

  beforeEach(() => {
    useDeploymentLogs.mockReturnValue({
      data: mockLogs,
      pauseLogs: false,
      setPauseLogs: jest.fn(),
      newMessagesAvailable: false,
      setNewMessagesAvailable: jest.fn(),
      showPreviousLogs: false,
      setShowPreviousLogs: jest.fn(),
    })

    useDeploymentStatus.mockReturnValue({
      data: { state: 'RUNNING' },
    })

    useService.mockReturnValue({
      data: {
        id: 'service-1',
        name: 'Test Service',
        serviceType: 'APPLICATION',
      },
    })
    useLinks.mockReturnValue({
      data: [{ id: 'link-1', url: 'https://example.com', is_default: false, is_qovery_domain: false }],
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <ListDeploymentLogs
        environment={mockEnvironment}
        deploymentHistoryEnvironment={mockDeploymentHistoryEnvironment}
        serviceStatus={mockServiceStatus}
      />
    )
    expect(baseElement).toBeTruthy()
  })

  it('should display logs', () => {
    renderWithProviders(
      <ListDeploymentLogs
        environment={mockEnvironment}
        deploymentHistoryEnvironment={mockDeploymentHistoryEnvironment}
        serviceStatus={mockServiceStatus}
      />
    )

    expect(screen.getByText('Log 1')).toBeInTheDocument()
    expect(screen.getByText('Log 2')).toBeInTheDocument()
  })

  it('should filter logs by stage step', async () => {
    const { userEvent } = renderWithProviders(
      <ListDeploymentLogs
        environment={mockEnvironment}
        deploymentHistoryEnvironment={mockDeploymentHistoryEnvironment}
        serviceStatus={mockServiceStatus}
      />
    )

    const buildButton = screen.getByRole('button', { name: /build/i })
    await userEvent.click(buildButton)

    await waitFor(() => {
      expect(screen.getByText('Log 1')).toBeInTheDocument()
      expect(screen.queryByText('Log 2')).not.toBeInTheDocument()
    })
  })

  it('should show progress indicator when deployment is progressing', () => {
    useDeploymentStatus.mockReturnValue({
      data: { state: 'BUILDING' },
    })

    renderWithProviders(
      <ListDeploymentLogs
        environment={mockEnvironment}
        deploymentHistoryEnvironment={mockDeploymentHistoryEnvironment}
        serviceStatus={mockServiceStatus}
      />
    )

    expect(screen.getByText('Streaming service logs')).toBeInTheDocument()
  })
})
