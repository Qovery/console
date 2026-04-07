import { type Cluster, type ClusterStatus } from 'qovery-typescript-axios'
import { fireEvent, renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useClusterRunningErrorServices } from '../hooks/use-cluster-running-error-services/use-cluster-running-error-services'
import { useClusterRunningStatusSocket } from '../hooks/use-cluster-running-status-socket/use-cluster-running-status-socket'
import { ClusterServiceRunningStatusSockets } from '../hooks/use-cluster-service-running-status-socket/cluster-service-running-status-sockets'
import { ClusterProductionCard } from './cluster-production-card'

const mockNavigate = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
}))
jest.mock('../hooks/use-cluster-running-status-socket/use-cluster-running-status-socket')
jest.mock('../hooks/use-cluster-running-error-services/use-cluster-running-error-services')
jest.mock('../hooks/use-cluster-service-running-status-socket/cluster-service-running-status-sockets', () => ({
  ClusterServiceRunningStatusSockets: jest.fn(() => null),
}))
jest.mock('../cluster-running-status-indicator/cluster-running-status-indicator', () => ({
  ClusterRunningStatusIndicator: () => <span data-testid="cluster-running-status-indicator" />,
}))

const mockUseClusterRunningStatusSocket = jest.mocked(useClusterRunningStatusSocket)
const mockUseClusterRunningErrorServices = jest.mocked(useClusterRunningErrorServices)
const mockClusterServiceRunningStatusSockets = jest.mocked(ClusterServiceRunningStatusSockets)

const mockCluster = {
  id: 'cluster-id',
  name: 'kube-production',
  organization: { id: 'org-id' },
  cloud_provider: 'AWS',
  production: true,
} as Cluster

const mockClusterStatus = {
  status: 'DEPLOYED',
} as ClusterStatus

describe('ClusterProductionCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseClusterRunningErrorServices.mockReturnValue({
      serviceCount: 200,
      errorServiceCount: 0,
      errorServices: [],
      hiddenErrorServiceCount: 0,
    })
  })

  it('should display the healthy state when services are up to date', () => {
    renderWithProviders(<ClusterProductionCard cluster={mockCluster} clusterStatus={mockClusterStatus} />)

    expect(screen.getByText('200 services')).toBeInTheDocument()
    expect(screen.getByText('All services running and up to date')).toBeInTheDocument()
    expect(screen.queryByText(/running error/i)).not.toBeInTheDocument()
  })

  it('should display issue rows inspired by the production health design', () => {
    mockUseClusterRunningErrorServices.mockReturnValue({
      serviceCount: 200,
      errorServiceCount: 3,
      errorServices: [
        {
          environmentId: 'env-1',
          environmentName: 'web-alan-website',
          projectId: 'project-1',
          projectName: 'activepieces-prod',
          serviceId: 'service-1',
          serviceName: 'activepieces-prod-cloudflared',
        },
        {
          environmentId: 'env-2',
          environmentName: 'billing',
          projectId: 'project-2',
          projectName: 'backoffice',
          serviceId: 'service-2',
          serviceName: 'gateway',
        },
      ],
      hiddenErrorServiceCount: 1,
    })

    renderWithProviders(<ClusterProductionCard cluster={mockCluster} clusterStatus={mockClusterStatus} />)

    expect(screen.getByText('3 services in running error')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'web-alan-website / activepieces-prod / activepieces-prod-cloudflared' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'billing / backoffice / gateway' })).toBeInTheDocument()
    expect(screen.getByText('+1 more service in error')).toBeInTheDocument()
  })

  it('should navigate to the related service when an error item is clicked', () => {
    mockUseClusterRunningErrorServices.mockReturnValue({
      serviceCount: 200,
      errorServiceCount: 1,
      errorServices: [
        {
          environmentId: 'env-1',
          environmentName: 'web-alan-website',
          projectId: 'project-1',
          projectName: 'activepieces-prod',
          serviceId: 'service-1',
          serviceName: 'activepieces-prod-cloudflared',
        },
      ],
      hiddenErrorServiceCount: 0,
    })

    renderWithProviders(<ClusterProductionCard cluster={mockCluster} clusterStatus={mockClusterStatus} />)

    fireEvent.click(
      screen.getByRole('button', { name: 'web-alan-website / activepieces-prod / activepieces-prod-cloudflared' })
    )

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview',
      params: {
        organizationId: 'org-id',
        projectId: 'project-1',
        environmentId: 'env-1',
        serviceId: 'service-1',
      },
    })
  })

  it('should collapse the accordion without navigating to the cluster overview', () => {
    mockUseClusterRunningErrorServices.mockReturnValue({
      serviceCount: 200,
      errorServiceCount: 1,
      errorServices: [
        {
          environmentId: 'env-1',
          environmentName: 'web-alan-website',
          projectId: 'project-1',
          projectName: 'activepieces-prod',
          serviceId: 'service-1',
          serviceName: 'activepieces-prod-cloudflared',
        },
      ],
      hiddenErrorServiceCount: 0,
    })

    renderWithProviders(<ClusterProductionCard cluster={mockCluster} clusterStatus={mockClusterStatus} />)

    fireEvent.click(screen.getByRole('button', { name: /1 service in running error/i }))

    expect(
      screen.queryByRole('button', { name: 'web-alan-website / activepieces-prod / activepieces-prod-cloudflared' })
    ).not.toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('should display the empty state subtitle when the cluster has no services', () => {
    mockUseClusterRunningErrorServices.mockReturnValue({
      serviceCount: 0,
      errorServiceCount: 0,
      errorServices: [],
      hiddenErrorServiceCount: 0,
    })

    renderWithProviders(<ClusterProductionCard cluster={mockCluster} clusterStatus={mockClusterStatus} />)

    expect(screen.getByText('No services created yet')).toBeInTheDocument()
    expect(screen.queryByText('All services running and up to date')).not.toBeInTheDocument()
  })

  it('should not display the healthy state when the cluster is not deployed', () => {
    renderWithProviders(
      <ClusterProductionCard cluster={mockCluster} clusterStatus={{ status: 'DEPLOYING' } as ClusterStatus} />
    )

    expect(screen.queryByText('All services running and up to date')).not.toBeInTheDocument()
  })

  it('should initialize the cluster sockets and navigate to the overview when the card is clicked', () => {
    renderWithProviders(<ClusterProductionCard cluster={mockCluster} clusterStatus={mockClusterStatus} />)

    expect(mockUseClusterRunningStatusSocket).toHaveBeenCalledWith({
      organizationId: 'org-id',
      clusterId: 'cluster-id',
    })
    expect(mockClusterServiceRunningStatusSockets).toHaveBeenCalledWith(
      {
        organizationId: 'org-id',
        clusterId: 'cluster-id',
      },
      {}
    )

    fireEvent.click(screen.getByRole('link'))

    expect(mockNavigate).toHaveBeenLastCalledWith({
      to: '/organization/$organizationId/cluster/$clusterId/overview',
      params: { organizationId: 'org-id', clusterId: 'cluster-id' },
    })
  })
})
