import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceInstance } from './service-instance'

jest.mock('../instance-metrics/instance-metrics', () => ({
  InstanceMetrics: ({ children }: { children?: React.ReactNode }) => (
    <div>
      <span>instance-metrics</span>
      {children}
    </div>
  ),
}))

jest.mock('../service-header/service-header', () => ({
  GitRepository: () => <span>mock-git-repository</span>,
}))

describe('ServiceInstance', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders fixed scaling and resource limits for application service', () => {
    const service = {
      id: 'service-app-1',
      serviceType: 'APPLICATION',
      environment: { id: 'env-1' },
      cpu: 500,
      memory: 1024,
      min_running_instances: 2,
      max_running_instances: 2,
      gpu: 0,
    }

    renderWithProviders(<ServiceInstance service={service as never} />)

    expect(screen.getByText('Scaling method:')).toBeInTheDocument()
    expect(screen.getByText('Fixed')).toBeInTheDocument()
    expect(screen.getByText('Instances min/max:')).toBeInTheDocument()
    expect(screen.getByText('2/2')).toBeInTheDocument()
    expect(screen.getByText('vCPU limit:')).toBeInTheDocument()
    expect(screen.getByText('Memory limit:')).toBeInTheDocument()
    expect(screen.queryByText('GPU limit:')).not.toBeInTheDocument()
  })

  it('renders HPA scaling and gpu limit when min/max instances differ', () => {
    const service = {
      id: 'service-app-2',
      serviceType: 'APPLICATION',
      environment: { id: 'env-1' },
      cpu: 250,
      memory: 512,
      min_running_instances: 1,
      max_running_instances: 3,
      gpu: 1,
    }

    renderWithProviders(<ServiceInstance service={service as never} />)

    expect(screen.getByText('HPA')).toBeInTheDocument()
    expect(screen.getByText('GPU limit:')).toBeInTheDocument()
  })

  it('renders cron scheduling details and cron help callout for cron jobs', () => {
    const service = {
      id: 'service-job-1',
      serviceType: 'JOB',
      job_type: 'CRON',
      environment: { id: 'env-1' },
      cpu: 100,
      memory: 256,
      max_duration_seconds: 600,
      max_nb_restart: 2,
      port: 8080,
      schedule: {
        cronjob: {
          timezone: 'UTC',
          scheduled_at: '0 0 * * *',
        },
      },
    }

    renderWithProviders(<ServiceInstance service={service as never} />)

    expect(screen.getByText('Scheduling (UTC):')).toBeInTheDocument()
    expect(screen.getByText('Restart (max):')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Duration (max):')).toBeInTheDocument()
    expect(screen.getByText('600 s')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /see documentation/i })).toBeInTheDocument()
  })

  it('renders helm values override from git repository with arguments', () => {
    const service = {
      id: 'service-helm-1',
      serviceType: 'HELM',
      environment: { id: 'env-1' },
      values_override: {
        file: {
          git: {
            git_repository: {
              url: 'https://github.com/Qovery/console',
              name: 'Qovery/console',
            },
          },
        },
        set: ['key=value'],
        set_json: [],
        set_string: [],
      },
    }

    renderWithProviders(<ServiceInstance service={service as never} />)

    expect(screen.getByText('Type:')).toBeInTheDocument()
    expect(screen.getByText('Git repository')).toBeInTheDocument()
    expect(screen.getByText('mock-git-repository')).toBeInTheDocument()
    expect(screen.getByText('Override with arguments:')).toBeInTheDocument()
    expect(screen.getByText('Yes')).toBeInTheDocument()
  })
})
