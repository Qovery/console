import { ClusterStateEnum } from 'qovery-typescript-axios'
import { useClusterMetrics } from '@qovery/domains/cluster-metrics/feature'
import {
  useCluster,
  useClusterLogs,
  useClusterRunningStatus,
  useClusterStatus,
  useDeploymentProgress,
} from '@qovery/domains/clusters/feature'
import { useProjects } from '@qovery/domains/projects/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageOverviewFeature from './page-overview-feature'

jest.mock('@qovery/domains/clusters/feature', () => ({
  useCluster: jest.fn(),
  useClusterRunningStatus: jest.fn(),
  useClusterLogs: jest.fn(),
  useClusterStatus: jest.fn(),
  useDeploymentProgress: jest.fn(),
}))

jest.mock('@qovery/domains/cluster-metrics/feature', () => ({
  useClusterMetrics: jest.fn(),
  ClusterCardNodeUsage: () => <div>ClusterCardNodeUsage</div>,
  ClusterCardResources: () => <div>ClusterCardResources</div>,
  ClusterCardSetup: () => <div>ClusterCardSetup</div>,
  ClusterTableNode: () => <div>ClusterTableNode</div>,
  ClusterTableNodepool: () => <div>ClusterTableNodepool</div>,
}))

jest.mock('@qovery/domains/projects/feature', () => ({
  useProjects: jest.fn(),
}))

describe('PageOverviewFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useClusterRunningStatus).mockReturnValue({
      data: { computed_status: { global_status: 'RUNNING' } },
    })
    jest.mocked(useCluster).mockReturnValue({
      data: {
        id: 'cluster-123',
        name: 'test-cluster',
        cloud_provider: 'AWS',
        instance_type: 'MANAGED',
        max_running_nodes: 10,
        min_running_nodes: 1,
      },
    })
    jest.mocked(useClusterMetrics).mockReturnValue({
      data: {
        node_pools: [],
        nodes: [],
      },
    })
    jest.mocked(useClusterLogs).mockReturnValue({
      data: [],
    })
    jest.mocked(useClusterStatus).mockReturnValue({
      data: { is_deployed: true, status: ClusterStateEnum.DEPLOYED },
    })
    jest.mocked(useDeploymentProgress).mockReturnValue({
      steps: [{ label: 'Validating config', status: 'current' }],
      installationComplete: false,
      highestStepIndex: 0,
      progressValue: 0.1,
      currentStepLabel: 'Validating config',
      creationFailed: false,
      state: 'installing',
      justSucceeded: false,
      justFailed: false,
    })
    jest.mocked(useProjects).mockReturnValue({
      data: [],
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOverviewFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should render placeholder when running status is unavailable', () => {
    jest.mocked(useClusterRunningStatus).mockReturnValue({
      data: 'NotFound',
    })
    renderWithProviders(<PageOverviewFeature />)
    expect(screen.getByText('No metrics available because the running status is unavailable.')).toBeInTheDocument()
  })

  it('should display deployment ongoing card when cluster creation is in progress', () => {
    jest.mocked(useClusterStatus).mockReturnValue({
      data: { is_deployed: false, status: ClusterStateEnum.DEPLOYING },
    })
    jest.mocked(useCluster).mockReturnValue({
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
