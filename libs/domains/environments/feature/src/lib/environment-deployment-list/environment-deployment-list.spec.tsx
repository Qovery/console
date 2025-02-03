import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { EnvironmentDeploymentList } from './environment-deployment-list'

const mockEnvironment = {
  id: 'env-123',
  name: 'test-env',
  organization: { id: 'org-123' },
  project: { id: 'proj-123' },
  mode: 'DEVELOPMENT',
}

const mockDeploymentHistory = [
  {
    identifier: {
      execution_id: 'exec-123',
    },
    status: 'DEPLOYED',
    action_status: 'SUCCESS',
    trigger_action: 'DEPLOY',
    total_duration: 'PT60M',
    stages: [
      {
        name: 'build',
        status: 'SUCCESS',
        duration: 'PT60M',
        services: [
          {
            identifier: {
              name: 'web-service',
              service_id: 'service-123',
              execution_id: 'exec-123',
              service_type: 'APPLICATION',
            },
            status_details: {
              status: 'SUCCESS',
            },
            total_duration: 'PT60M',
            auditing_data: {
              created_at: '2024-01-30T12:00:00Z',
              updated_at: '2024-01-30T12:01:00Z',
              origin: 'CONSOLE',
              triggered_by: 'User',
            },
          },
        ],
      },
    ],
    auditing_data: {
      created_at: '2024-01-30T12:00:00Z',
      updated_at: '2024-01-30T12:01:00Z',
      origin: 'CONSOLE',
      triggered_by: 'User',
    },
  },
]

const mockDeploymentQueue = [
  {
    trigger_action: 'DEPLOY',
    stages: [
      {
        status: 'QUEUED',
        services: [
          {
            identifier: {
              name: 'api-service',
              service_id: 'service-456',
              service_type: 'APPLICATION',
            },
          },
        ],
      },
    ],
    auditing_data: {
      created_at: '2024-01-30T12:02:00Z',
      origin: 'CONSOLE',
      triggered_by: 'User',
    },
  },
]

jest.mock('../hooks/use-environment/use-environment', () => ({
  useEnvironment: () => ({
    data: mockEnvironment,
    isFetched: true,
  }),
}))

jest.mock('../hooks/use-deployment-history/use-deployment-history', () => ({
  useDeploymentHistory: () => ({
    data: mockDeploymentHistory,
    isFetched: true,
  }),
}))

jest.mock('../hooks/use-deployment-queue/use-deployment-queue', () => ({
  useDeploymentQueue: () => ({
    data: mockDeploymentQueue,
    isFetched: true,
  }),
}))

describe('EnvironmentDeploymentList', () => {
  it('should render the deployment list', async () => {
    renderWithProviders(<EnvironmentDeploymentList environmentId="env-123" />)

    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Status deployment')).toBeInTheDocument()
    expect(screen.getByText('Pipeline')).toBeInTheDocument()
    expect(screen.getByText('Duration')).toBeInTheDocument()
    expect(screen.getByText('Trigger by')).toBeInTheDocument()

    expect(screen.getByText('exec-123')).toBeInTheDocument()
    expect(screen.getAllByText('Deploy')[0]).toBeInTheDocument()
    expect(screen.getByText('Success')).toBeInTheDocument()
  })

  it('should render the queue item', async () => {
    renderWithProviders(<EnvironmentDeploymentList environmentId="env-123" />)

    expect(screen.getAllByText('In queue...')[0]).toBeInTheDocument()
  })
})
