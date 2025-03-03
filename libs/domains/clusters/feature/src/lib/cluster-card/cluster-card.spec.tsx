import { type Cluster, type ClusterStatus } from 'qovery-typescript-axios'
import { timeAgo } from '@qovery/shared/util-dates'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useClusterRunningStatusSocket } from '../hooks/use-cluster-running-status-socket/use-cluster-running-status-socket'
import { ClusterCard } from './cluster-card'

jest.mock('../hooks/use-cluster-running-status-socket/use-cluster-running-status-socket')
jest.mock('@qovery/shared/util-dates', () => ({
  timeAgo: jest.fn(),
}))

const mockUseClusterRunningStatusSocket = useClusterRunningStatusSocket as jest.MockedFunction<
  typeof useClusterRunningStatusSocket
>

const mockCluster = {
  id: 'cluster-id',
  name: 'Test Cluster',
  organization: { id: 'org-id' },
  cloud_provider: 'AWS',
  production: true,
  is_default: false,
  kubernetes: 'MANAGED',
  region: 'us-east-1',
  version: '1.21',
  instance_type: 't3.medium',
  created_at: '2023-01-01T12:00:00Z',
} as Cluster

const mockClusterDeploymentStatus = {
  status: 'DEPLOYED',
} as ClusterStatus

describe('ClusterCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(timeAgo).mockReturnValue('2 months ago')
  })

  it('should render correctly', () => {
    const { container } = renderWithProviders(
      <ClusterCard cluster={mockCluster} clusterDeploymentStatus={mockClusterDeploymentStatus} />
    )
    expect(container).toBeInTheDocument()
  })

  it('should match snapshot', () => {
    const { container } = renderWithProviders(
      <ClusterCard cluster={mockCluster} clusterDeploymentStatus={mockClusterDeploymentStatus} />
    )
    expect(container).toMatchSnapshot()
  })

  it('should display cluster name', () => {
    renderWithProviders(<ClusterCard cluster={mockCluster} clusterDeploymentStatus={mockClusterDeploymentStatus} />)
    expect(screen.getByText('Test Cluster')).toBeInTheDocument()
  })

  it('should display creation time when status is not building/deploying/canceling/deleting', () => {
    renderWithProviders(<ClusterCard cluster={mockCluster} clusterDeploymentStatus={mockClusterDeploymentStatus} />)

    expect(screen.getByText('2 months ago')).toBeInTheDocument()
    expect(timeAgo).toHaveBeenCalledWith(new Date('2023-01-01T12:00:00Z'))
  })

  it('should display status text when status is building', () => {
    renderWithProviders(
      <ClusterCard cluster={mockCluster} clusterDeploymentStatus={{ status: 'BUILDING' } as ClusterStatus} />
    )

    expect(screen.getByText('Building...')).toBeInTheDocument()
  })

  it('should display status text when status is deploying', () => {
    renderWithProviders(
      <ClusterCard cluster={mockCluster} clusterDeploymentStatus={{ status: 'DEPLOYING' } as ClusterStatus} />
    )

    expect(screen.getByText('Deploying...')).toBeInTheDocument()
  })

  it('should display status text when status is canceling', () => {
    renderWithProviders(
      <ClusterCard cluster={mockCluster} clusterDeploymentStatus={{ status: 'CANCELING' } as ClusterStatus} />
    )

    expect(screen.getByText('Canceling...')).toBeInTheDocument()
  })

  it('should display Qovery managed badge for managed Kubernetes', () => {
    renderWithProviders(<ClusterCard cluster={mockCluster} clusterDeploymentStatus={mockClusterDeploymentStatus} />)

    expect(screen.getByText('Qovery managed')).toBeInTheDocument()
  })

  it('should display Self managed badge for self managed Kubernetes', () => {
    const selfManagedCluster = {
      ...mockCluster,
      kubernetes: 'SELF_MANAGED',
    } as Cluster

    renderWithProviders(
      <ClusterCard cluster={selfManagedCluster} clusterDeploymentStatus={mockClusterDeploymentStatus} />
    )

    expect(screen.getByText('Self managed')).toBeInTheDocument()
  })

  it('should display region', () => {
    renderWithProviders(<ClusterCard cluster={mockCluster} clusterDeploymentStatus={mockClusterDeploymentStatus} />)

    expect(screen.getByText('us-east-1')).toBeInTheDocument()
  })

  it('should not display region for on-premise', () => {
    const onPremiseCluster = {
      ...mockCluster,
      cloud_provider: 'ON_PREMISE',
      region: 'on-premise',
    } as Cluster

    renderWithProviders(
      <ClusterCard cluster={onPremiseCluster} clusterDeploymentStatus={mockClusterDeploymentStatus} />
    )

    expect(screen.queryByText('on-premise')).not.toBeInTheDocument()
  })

  it('should display version', () => {
    renderWithProviders(<ClusterCard cluster={mockCluster} clusterDeploymentStatus={mockClusterDeploymentStatus} />)

    expect(screen.getByText('1.21')).toBeInTheDocument()
  })

  it('should display production badge for production clusters', () => {
    renderWithProviders(<ClusterCard cluster={mockCluster} clusterDeploymentStatus={mockClusterDeploymentStatus} />)

    expect(screen.getByText('Production')).toBeInTheDocument()
  })

  it('should not display production badge for non-production clusters', () => {
    const nonProductionCluster = {
      ...mockCluster,
      production: false,
    } as Cluster

    renderWithProviders(
      <ClusterCard cluster={nonProductionCluster} clusterDeploymentStatus={mockClusterDeploymentStatus} />
    )

    expect(screen.queryByText('Production')).not.toBeInTheDocument()
  })

  it('should initialize socket connection with correct params', () => {
    renderWithProviders(<ClusterCard cluster={mockCluster} clusterDeploymentStatus={mockClusterDeploymentStatus} />)

    expect(mockUseClusterRunningStatusSocket).toHaveBeenCalledWith({
      organizationId: 'org-id',
      clusterId: 'cluster-id',
    })
  })
})
