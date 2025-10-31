import { DatabaseModeEnum } from 'qovery-typescript-axios'
import { render, screen } from '@qovery/shared/util-tests'
import { PageMonitoringFeature } from './page-monitoring-feature'

const mockUseParams = jest.fn()
const mockUseEnvironment = jest.fn()
const mockUseDeploymentStatus = jest.fn()
const mockUseService = jest.fn()
const mockUseCluster = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
}))

jest.mock('@qovery/domains/environments/feature', () => ({
  useEnvironment: () => mockUseEnvironment(),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  useDeploymentStatus: () => mockUseDeploymentStatus(),
  useService: () => mockUseService(),
}))

jest.mock('@qovery/domains/clusters/feature', () => ({
  useCluster: () => mockUseCluster(),
}))

jest.mock('@qovery/shared/util-hooks', () => ({
  useDocumentTitle: jest.fn(),
}))

jest.mock('@qovery/domains/observability/feature', () => ({
  EnableObservabilityButtonContactUs: () => <div>Enable Button</div>,
  EnableObservabilityContent: () => <div>Enable Content</div>,
  EnableObservabilityVideo: () => <div>Enable Video</div>,
  RdsManagedDbOverview: () => <div>RDS Overview</div>,
}))

jest.mock('./placeholder-monitoring', () => ({
  PlaceholderMonitoring: () => <div>Placeholder</div>,
}))

describe('PageMonitoringFeature', () => {
  const defaultParams = {
    databaseId: 'db-123',
    environmentId: 'env-123',
  }

  const defaultEnvironment = {
    data: {
      organization: { id: 'org-123' },
      cluster_id: 'cluster-123',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParams.mockReturnValue(defaultParams)
    mockUseEnvironment.mockReturnValue(defaultEnvironment)
  })

  it('should render null when data is not fetched', () => {
    mockUseService.mockReturnValue({ isFetched: false })
    mockUseCluster.mockReturnValue({ isFetched: false })
    mockUseDeploymentStatus.mockReturnValue({})

    const { container } = render(<PageMonitoringFeature />)
    expect(container).toBeEmptyDOMElement()
  })

  it('should render upsell modal when metrics are not enabled', () => {
    mockUseService.mockReturnValue({
      data: { serviceType: 'DATABASE', mode: DatabaseModeEnum.MANAGED },
      isFetched: true,
    })
    mockUseCluster.mockReturnValue({
      data: {
        cloud_provider: 'AWS',
        metrics_parameters: { enabled: false },
      },
      isFetched: true,
    })
    mockUseDeploymentStatus.mockReturnValue({ data: { state: 'RUNNING' } })

    render(<PageMonitoringFeature />)
    expect(screen.getByText('Database health check')).toBeInTheDocument()
    expect(screen.getByText('Enable Content')).toBeInTheDocument()
  })

  it('should render not deployed message when database is stopped', () => {
    mockUseService.mockReturnValue({
      data: { serviceType: 'DATABASE', mode: DatabaseModeEnum.MANAGED },
      isFetched: true,
    })
    mockUseCluster.mockReturnValue({
      data: {
        cloud_provider: 'AWS',
        metrics_parameters: { enabled: true },
      },
      isFetched: true,
    })
    mockUseDeploymentStatus.mockReturnValue({ data: { state: 'STOPPED' } })

    render(<PageMonitoringFeature />)
    expect(screen.getByText('Monitoring is not available')).toBeInTheDocument()
    expect(screen.getByText('Deploy this database to view monitoring data')).toBeInTheDocument()
  })

  it('should render RDS overview when metrics are enabled and database is running', () => {
    mockUseService.mockReturnValue({
      data: { serviceType: 'DATABASE', mode: DatabaseModeEnum.MANAGED },
      isFetched: true,
    })
    mockUseCluster.mockReturnValue({
      data: {
        cloud_provider: 'AWS',
        metrics_parameters: { enabled: true },
      },
      isFetched: true,
    })
    mockUseDeploymentStatus.mockReturnValue({ data: { state: 'RUNNING' } })

    render(<PageMonitoringFeature />)
    expect(screen.getByText('RDS Overview')).toBeInTheDocument()
  })

  it('should not show monitoring for non-AWS providers', () => {
    mockUseService.mockReturnValue({
      data: { serviceType: 'DATABASE', mode: DatabaseModeEnum.MANAGED },
      isFetched: true,
    })
    mockUseCluster.mockReturnValue({
      data: {
        cloud_provider: 'GCP',
        metrics_parameters: { enabled: true },
      },
      isFetched: true,
    })
    mockUseDeploymentStatus.mockReturnValue({ data: { state: 'RUNNING' } })

    render(<PageMonitoringFeature />)
    expect(screen.getByText('Enable Content')).toBeInTheDocument()
  })

  it('should not show monitoring for container mode databases', () => {
    mockUseService.mockReturnValue({
      data: { serviceType: 'DATABASE', mode: DatabaseModeEnum.CONTAINER },
      isFetched: true,
    })
    mockUseCluster.mockReturnValue({
      data: {
        cloud_provider: 'AWS',
        metrics_parameters: { enabled: true },
      },
      isFetched: true,
    })
    mockUseDeploymentStatus.mockReturnValue({ data: { state: 'RUNNING' } })

    render(<PageMonitoringFeature />)
    expect(screen.getByText('Enable Content')).toBeInTheDocument()
  })
})
