import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type ReactNode } from 'react'
import { applicationFactoryMock, environmentFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import {
  DeploymentLogsLoader,
  DeploymentLogsPlaceholder,
  type DeploymentLogsPlaceholderProps,
} from './deployment-logs-placeholder'

jest.mock('posthog-js/react', () => ({ useFeatureFlagEnabled: jest.fn() }))

const mockEnvironment = environmentFactoryMock(1)[0]
const mockApplication = applicationFactoryMock(1)[0]

jest.mock('@qovery/domains/services/feature', () => ({
  useService: () => ({ data: mockApplication }),
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'org-123',
    projectId: 'proj-123',
    environmentId: 'env-123',
    serviceId: 'serv-123',
    executionId: 'exec-1',
  }),
  Link: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
    <a {...props} href={`${props.to}`}>
      {children}
    </a>
  ),
}))

describe('DeploymentLogsPlaceholder', () => {
  beforeEach(() => {
    jest.mocked(useFeatureFlagEnabled).mockReturnValue(false)
  })

  it.each([false, undefined])('preserves the current page loader when the flag is %s', (flag) => {
    jest.mocked(useFeatureFlagEnabled).mockReturnValue(flag)

    renderWithProviders(<DeploymentLogsLoader />)

    expect(screen.getByText('Deployment logs are loading…')).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: 'Loading deployment logs' })).not.toBeInTheDocument()
  })

  it('shows the page skeleton when the flag is enabled', () => {
    jest.mocked(useFeatureFlagEnabled).mockReturnValue(true)

    renderWithProviders(<DeploymentLogsLoader />)

    expect(screen.getByRole('status', { name: 'Loading deployment logs' })).toBeInTheDocument()
    expect(screen.queryByText('Deployment logs are loading…')).not.toBeInTheDocument()
  })

  it('shows the skeleton while the log lines are loading with the flag enabled', () => {
    jest.mocked(useFeatureFlagEnabled).mockReturnValue(true)

    renderWithProviders(
      <DeploymentLogsPlaceholder
        environment={mockEnvironment}
        itemsLength={0}
        serviceStatus={{
          id: 'serv-123',
          state: 'DEPLOYED',
          service_deployment_status: 'UP_TO_DATE',
          is_part_last_deployment: true,
        }}
      />
    )

    expect(screen.getByRole('status', { name: 'Loading deployment logs' })).toBeInTheDocument()
    expect(screen.queryByText('Deployment logs are loading…')).not.toBeInTheDocument()
  })

  const props: DeploymentLogsPlaceholderProps = {
    serviceStatus: undefined,
    itemsLength: 0,
    environmentDeploymentHistory: [],
    environment: mockEnvironment,
  }

  it('should render loader while deployment logs are still loading', () => {
    renderWithProviders(
      <DeploymentLogsPlaceholder
        itemsLength={1}
        environment={mockEnvironment}
        serviceStatus={{
          id: 'serv-123',
          state: 'BUILDING',
          service_deployment_status: 'OUT_OF_DATE',
          is_part_last_deployment: true,
        }}
        environmentDeploymentHistory={[
          {
            identifier: {
              execution_id: 'exec-1',
              environment_id: 'env-123',
            },
            stages: [
              {
                name: 'test',
                status: 'ONGOING',
                duration: '',
                services: [
                  {
                    identifier: {
                      name: 'service',
                      service_type: 'APPLICATION',
                      service_id: 'serv-123',
                    },
                    status: 'BUILDING',
                    auditing_data: {
                      created_at: '2024-09-18T07:02:14.324855Z',
                      updated_at: '',
                      triggered_by: '',
                    },
                    details: {},
                  },
                ],
              },
            ],
            auditing_data: {},
            status: 'BUILDING',
            trigger_action: 'DEPLOY',
            total_duration: '',
          },
        ]}
      />
    )

    expect(screen.getByText('Deployment logs are loading…')).toBeInTheDocument()
  })

  it('should render "No history deployment available"', () => {
    props.itemsLength = 1
    renderWithProviders(<DeploymentLogsPlaceholder {...props} />)

    expect(
      screen.getByText(`No history deployment available for this service ${mockApplication.name}.`)
    ).toBeInTheDocument()
  })

  it('should render spinner', () => {
    renderWithProviders(
      <DeploymentLogsPlaceholder
        itemsLength={0}
        environment={mockEnvironment}
        serviceStatus={{
          id: '0',
          state: 'DEPLOYED',
          service_deployment_status: 'UP_TO_DATE',
          is_part_last_deployment: true,
        }}
      />
    )

    expect(screen.getByText('Deployment logs are loading…')).toBeInTheDocument()
  })

  it('should render no logs placeholder', () => {
    renderWithProviders(
      <DeploymentLogsPlaceholder
        itemsLength={0}
        environment={mockEnvironment}
        environmentDeploymentHistory={[]}
        serviceStatus={{
          id: '0',
          state: 'DEPLOYED',
          service_deployment_status: 'UP_TO_DATE',
          is_part_last_deployment: false,
        }}
      />
    )

    expect(screen.getByText("Deployment logs are no longer available due to the deployment's age.")).toBeInTheDocument()
    expect(screen.getByText('No logs to display.')).toBeInTheDocument()
  })

  it.each([true, false])('preserves the queued state when the flag is %s', (flag) => {
    jest.mocked(useFeatureFlagEnabled).mockReturnValue(flag)
    renderWithProviders(
      <DeploymentLogsPlaceholder
        itemsLength={0}
        environment={mockEnvironment}
        serviceStatus={{
          id: '0',
          state: 'DEPLOYMENT_QUEUED',
          service_deployment_status: 'OUT_OF_DATE',
          is_part_last_deployment: true,
        }}
      />
    )

    expect(screen.getByText('The service is in the queue…')).toBeInTheDocument()
    expect(
      screen.getByText('The logs will be displayed automatically as soon as the deployment starts.')
    ).toBeInTheDocument()
  })

  it('should render canceled state', () => {
    renderWithProviders(
      <DeploymentLogsPlaceholder
        itemsLength={0}
        environment={mockEnvironment}
        serviceStatus={{
          id: '0',
          state: 'CANCELED',
          service_deployment_status: 'OUT_OF_DATE',
          is_part_last_deployment: true,
        }}
      />
    )

    expect(screen.getByText('Deployment has been canceled.')).toBeInTheDocument()
    expect(screen.getByText('No logs to display.')).toBeInTheDocument()
  })

  it('should render error state with pipeline link', () => {
    renderWithProviders(
      <DeploymentLogsPlaceholder
        itemsLength={0}
        environment={mockEnvironment}
        serviceStatus={{
          id: '0',
          state: 'ERROR',
          service_deployment_status: 'OUT_OF_DATE',
          is_part_last_deployment: true,
        }}
      />
    )

    expect(screen.getByText('An error occurred during deployment of another service.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /open pipeline/i })).toBeInTheDocument()
  })

  it('should render precheck error state', () => {
    renderWithProviders(
      <DeploymentLogsPlaceholder
        itemsLength={0}
        environment={mockEnvironment}
        serviceStatus={{
          id: '0',
          state: 'DEPLOYED',
          service_deployment_status: 'UP_TO_DATE',
          is_part_last_deployment: true,
        }}
        preCheckStage={{
          status: 'ERROR',
          started_at: '2024-01-01T00:00:00Z',
          ended_at: '2024-01-01T00:01:00Z',
          details: {
            service_name: 'test-service',
            error: 'Pre-check failed',
          },
        }}
      />
    )

    expect(screen.getByText('An error occurred during the precheck step.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /open precheck/i })).toBeInTheDocument()
  })
})
