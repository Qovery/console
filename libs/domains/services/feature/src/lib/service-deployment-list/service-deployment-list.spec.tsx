import { type Environment } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceDeploymentList } from './service-deployment-list'

const mockEnvironment = {
  id: 'env-123',
  name: 'test-env',
  organization: { id: 'org-123' },
  project: { id: 'proj-123' },
  mode: 'DEVELOPMENT',
} as Environment

const defaultDeploymentHistory = [
  {
    identifier: {
      execution_id: 'exec-123',
      service_id: '2f9b67bb-092e-4612-84c3-a426bb401279',
      service_type: 'JOB',
      name: 'my-job',
    },
    auditing_data: {
      created_at: '2025-01-23T08:55:20.092474Z',
      updated_at: '2025-01-23T08:55:42.898794Z',
      origin: 'CONSOLE',
      triggered_by: 'John Doe',
    },
    status: 'BUILD_ERROR',
    status_details: {
      action: 'DEPLOY',
      status: 'ERROR',
      sub_action: 'NONE',
    },
    details: {
      commit: {
        created_at: '2025-01-03T08:26:59.758976Z',
        git_commit_id: 'version-123',
        message: 'KO commit - Update Dockerfile',
        tag: '',
        author_name: 'GitHub',
        author_avatar_url: '',
        commit_page_url: 'https://github.com',
      },
      schedule: {
        cronjob: {
          arguments: ['cronjob.py'],
          entrypoint: 'python',
          scheduled_at: '* * * * *',
          timezone: 'Etc/UTC',
        },
      },
      job_type: 'CRON',
    },
    icon_uri: 'app://qovery-console/cron-job',
    total_duration: 'PT16.503S',
  },
]

const defaultDeploymentQueue = [
  {
    identifier: {
      service_id: '2f9b67bb-092e-4612-84c3-a426bb401279',
      service_type: 'JOB',
      name: 'my-job',
    },
    auditing_data: {
      created_at: '2025-01-23T08:55:20.092474Z',
      updated_at: '2025-01-23T08:55:42.898794Z',
      origin: 'API',
      triggered_by: 'Jane Doe',
    },
    status_details: {
      action: 'DEPLOY',
      status: 'QUEUED',
      sub_action: 'NONE',
    },
    icon_uri: 'app://qovery-console/cron-job',
  },
]

let mockDeploymentHistory = defaultDeploymentHistory
let mockDeploymentQueue = defaultDeploymentQueue

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

jest.mock('../hooks/use-service/use-service', () => ({
  useService: () => ({
    data: {
      serviceType: 'APPLICATION',
      service_type: 'APPLICATION',
      job_type: 'CRON',
    },
    isFetched: true,
  }),
}))

describe('ServiceDeploymentList', () => {
  beforeEach(() => {
    mockDeploymentHistory = defaultDeploymentHistory
    mockDeploymentQueue = defaultDeploymentQueue
  })

  it('should render columns and deployment data', async () => {
    renderWithProviders(<ServiceDeploymentList environment={mockEnvironment} serviceId="service-123" />)

    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Duration')).toBeInTheDocument()
    expect(screen.getByText('Version')).toBeInTheDocument()
    expect(screen.getByText('Trigger by')).toBeInTheDocument()

    expect(screen.getByText('exec-123')).toBeInTheDocument()
    expect(screen.getAllByText('Deploy')[0]).toBeInTheDocument()
    expect(screen.getByText('version')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Console')).toBeInTheDocument()
  })

  it('should render the queue item', async () => {
    renderWithProviders(<ServiceDeploymentList environment={mockEnvironment} serviceId="service-123" />)

    expect(screen.getAllByText('In queue...')[0]).toBeInTheDocument()
  })

  it('should render empty state when no deployment data is available', async () => {
    mockDeploymentHistory = []
    mockDeploymentQueue = []

    renderWithProviders(<ServiceDeploymentList environment={mockEnvironment} serviceId="service-123" />)

    expect(screen.getByText('No deployment started')).toBeInTheDocument()
    expect(
      screen.getByText('Manage the deployments by using the “Play” button in the header above')
    ).toBeInTheDocument()
  })
})
