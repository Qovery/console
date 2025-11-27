import { useClusterMetrics } from '@qovery/domains/cluster-metrics/feature'
import { useCluster, useClusterLogs, useClusterRunningStatus, useClusterStatus } from '@qovery/domains/clusters/feature'
import { useProjects } from '@qovery/domains/projects/feature'
import { ClusterStateEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageOverviewFeature from './page-overview-feature'

jest.mock('@qovery/domains/clusters/feature', () => ({
  useCluster: jest.fn(),
  useClusterRunningStatus: jest.fn(),
  useClusterLogs: jest.fn(),
  useClusterStatus: jest.fn(),
}))

jest.mock('@qovery/domains/cluster-metrics/feature', () => ({
  useClusterMetrics: jest.fn(),
}))

jest.mock('@qovery/domains/projects/feature', () => ({
  useProjects: jest.fn(),
}))

describe('PageOverviewFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useClusterRunningStatus as jest.Mock).mockReturnValue({
      data: { computed_status: { global_status: 'RUNNING' } },
    })
    ;(useCluster as jest.Mock).mockReturnValue({
      data: {
        id: 'cluster-123',
        name: 'test-cluster',
        cloud_provider: 'AWS',
        instance_type: 'MANAGED',
        max_running_nodes: 10,
        min_running_nodes: 1,
      },
    })
    ;(useClusterMetrics as jest.Mock).mockReturnValue({
      data: {
        node_pools: [],
        nodes: [],
      },
    })
    ;(useClusterLogs as jest.Mock).mockReturnValue({
      data: [],
    })
    ;(useClusterStatus as jest.Mock).mockReturnValue({
      data: { is_deployed: true, status: ClusterStateEnum.DEPLOYED },
    })
    ;(useProjects as jest.Mock).mockReturnValue({
      data: [],
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOverviewFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should render placeholder when running status is unavailable', () => {
    ;(useClusterRunningStatus as jest.Mock).mockReturnValue({
      data: 'NotFound',
    })
    renderWithProviders(<PageOverviewFeature />)
    expect(screen.getByText('No metrics available because the running status is unavailable.')).toBeInTheDocument()
  })

  it('should display deployment ongoing card when cluster creation is in progress', () => {
    ;(useClusterStatus as jest.Mock).mockReturnValue({
      data: { is_deployed: false, status: ClusterStateEnum.DEPLOYING },
    })
    ;(useCluster as jest.Mock).mockReturnValue({
      data: {
        id: 'cluster-123',
        name: 'test-cluster',
        cloud_provider: 'AWS',
        instance_type: 'MANAGED',
        max_running_nodes: 10,
        min_running_nodes: 1,
      },
    })

    renderWithProviders(<PageOverviewFeature />)

    expect(screen.getByText('Deployment ongoing')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /cluster logs/i })).toBeInTheDocument()
    expect(screen.getByText('Validating config')).toBeInTheDocument()
  })
})
