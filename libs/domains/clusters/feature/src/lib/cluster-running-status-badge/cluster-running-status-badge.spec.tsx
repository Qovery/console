import { type Cluster, type ClusterStatus } from 'qovery-typescript-axios'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { useClusterRunningStatus } from '../hooks/use-cluster-running-status/use-cluster-running-status'
import { ClusterRunningStatusBadge } from './cluster-running-status-badge'

jest.mock('../hooks/use-cluster-running-status/use-cluster-running-status')

const mockUseClusterRunningStatus = useClusterRunningStatus as jest.MockedFunction<typeof useClusterRunningStatus>

const mockCluster = {
  id: 'cluster-id',
  organization: { id: 'org-id' },
  status: 'DEPLOYED',
  is_demo: false,
} as Cluster

const mockClusterDeploymentStatus = {
  status: 'DEPLOYED',
} as ClusterStatus

describe('ClusterRunningStatusBadge', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render "Not installed" badge when cluster status is READY', () => {
    const readyCluster = {
      ...mockCluster,
      status: 'READY',
    } as Cluster

    mockUseClusterRunningStatus.mockReturnValue({
      data: undefined,
      isLoading: false,
    })

    renderWithProviders(
      <ClusterRunningStatusBadge cluster={readyCluster} clusterDeploymentStatus={mockClusterDeploymentStatus} />
    )

    expect(screen.getByText('Not installed')).toBeInTheDocument()
  })

  it('should render "Unknown" badge for demo clusters when timeout occurs', async () => {
    const demoCluster = {
      ...mockCluster,
      is_demo: true,
    } as Cluster

    mockUseClusterRunningStatus.mockReturnValue({
      data: undefined,
      isLoading: false,
    })

    jest.useFakeTimers()

    renderWithProviders(
      <ClusterRunningStatusBadge cluster={demoCluster} clusterDeploymentStatus={mockClusterDeploymentStatus} />
    )

    jest.advanceTimersByTime(3100)

    await waitFor(() => {
      expect(screen.getByText('Unknown')).toBeInTheDocument()
    })

    jest.useRealTimers()
  })

  it('should render "Status unavailable" badge for non-demo clusters when timeout occurs', async () => {
    mockUseClusterRunningStatus.mockReturnValue({
      data: undefined,
      isLoading: false,
    })

    jest.useFakeTimers()

    renderWithProviders(
      <ClusterRunningStatusBadge cluster={mockCluster} clusterDeploymentStatus={mockClusterDeploymentStatus} />
    )

    jest.advanceTimersByTime(3100)

    await waitFor(() => {
      expect(screen.getByText('Status unavailable')).toBeInTheDocument()
    })

    jest.useRealTimers()
  })

  it('should render "Running" badge when global status is RUNNING', () => {
    mockUseClusterRunningStatus.mockReturnValue({
      data: {
        computed_status: {
          global_status: 'RUNNING',
        },
      },
      isLoading: false,
    })

    renderWithProviders(
      <ClusterRunningStatusBadge cluster={mockCluster} clusterDeploymentStatus={mockClusterDeploymentStatus} />
    )

    expect(screen.getByText('running')).toBeInTheDocument()
  })

  it('should render "Warning" badge with count when global status is WARNING', () => {
    mockUseClusterRunningStatus.mockReturnValue({
      data: {
        computed_status: {
          global_status: 'WARNING',
          node_warnings: {
            'node-1': 'Low disk space',
            'node-2': 'High CPU usage',
          },
        },
      },
      isLoading: false,
    })

    renderWithProviders(
      <ClusterRunningStatusBadge cluster={mockCluster} clusterDeploymentStatus={mockClusterDeploymentStatus} />
    )

    expect(screen.getByText('warning')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('should render "Error" badge with count when global status is ERROR', () => {
    mockUseClusterRunningStatus.mockReturnValue({
      data: {
        computed_status: {
          global_status: 'ERROR',
          qovery_components_in_failure: [
            { type: 'Pod', component_name: 'qovery-engine' },
            { type: 'Service', component_name: 'qovery-api' },
          ],
        },
      },
      isLoading: false,
    })

    renderWithProviders(
      <ClusterRunningStatusBadge cluster={mockCluster} clusterDeploymentStatus={mockClusterDeploymentStatus} />
    )

    expect(screen.getByText('error')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('should render "Status unavailable" badge for unknown global status', () => {
    mockUseClusterRunningStatus.mockReturnValue({
      data: {
        computed_status: {
          global_status: 'UNKNOWN',
        },
      },
      isLoading: false,
    })

    renderWithProviders(
      <ClusterRunningStatusBadge cluster={mockCluster} clusterDeploymentStatus={mockClusterDeploymentStatus} />
    )

    expect(screen.getByText('Status unavailable')).toBeInTheDocument()
  })

  it('should open popover when clicking on WARNING badge', async () => {
    mockUseClusterRunningStatus.mockReturnValue({
      data: {
        computed_status: {
          global_status: 'WARNING',
          node_warnings: {
            'node-1': 'Low disk space',
          },
        },
      },
      isLoading: false,
    })

    const { userEvent } = renderWithProviders(
      <ClusterRunningStatusBadge cluster={mockCluster} clusterDeploymentStatus={mockClusterDeploymentStatus} />
    )

    const badge = screen.getByText('warning')
    await userEvent.click(badge)

    await waitFor(() => {
      expect(screen.getByText('node-1: Low disk space')).toBeInTheDocument()
    })
  })

  it('should open popover when clicking on ERROR badge with failures', async () => {
    mockUseClusterRunningStatus.mockReturnValue({
      data: {
        computed_status: {
          global_status: 'ERROR',
          qovery_components_in_failure: [{ type: 'Pod', component_name: 'qovery-engine' }],
        },
      },
      isLoading: false,
    })

    const { userEvent } = renderWithProviders(
      <ClusterRunningStatusBadge cluster={mockCluster} clusterDeploymentStatus={mockClusterDeploymentStatus} />
    )

    const badge = screen.getByText('error')
    await userEvent.click(badge)

    await waitFor(() => {
      expect(screen.getByText('Pod: qovery-engine')).toBeInTheDocument()
    })
  })
})
