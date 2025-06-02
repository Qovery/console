import { useClusterMetrics } from '@qovery/domains/cluster-metrics/feature'
import { useCluster, useClusterRunningStatus } from '@qovery/domains/clusters/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageOverviewFeature from './page-overview-feature'

jest.mock('@qovery/domains/clusters/feature', () => ({
  useCluster: jest.fn(),
  useClusterRunningStatus: jest.fn(),
}))

jest.mock('@qovery/domains/cluster-metrics/feature', () => ({
  useClusterMetrics: jest.fn(),
}))

describe('PageOverviewFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useClusterRunningStatus as jest.Mock).mockReturnValue({
      data: 'NotFound',
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
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOverviewFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should render placeholder when running status is unavailable', () => {
    renderWithProviders(<PageOverviewFeature />)
    expect(screen.getByText('No metrics available because the running status is unavailable.')).toBeInTheDocument()
  })
})
