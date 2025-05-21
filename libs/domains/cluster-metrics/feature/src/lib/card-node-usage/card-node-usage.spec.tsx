import { useCluster, useClusterRunningStatus } from '@qovery/domains/clusters/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { CardNodeUsage } from './card-node-usage'

jest.mock('@qovery/domains/clusters/feature', () => ({
  useCluster: jest.fn(),
  useClusterRunningStatus: jest.fn(),
}))

describe('CardNodeUsage', () => {
  const mockOrganizationId = 'org-123'
  const mockClusterId = 'cluster-456'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const setupMocks = (clusterProvider = 'AWS', instanceType = 'KARPENTER', runningStatus = null) => {
    const mockCluster = {
      cloud_provider: clusterProvider,
      instance_type: instanceType,
      min_running_nodes: 2,
      max_running_nodes: 5,
    }

    const defaultRunningStatus = {
      nodes: [
        { conditions: [{ type: 'Ready', status: 'True' }] },
        { conditions: [{ type: 'Ready', status: 'True' }] },
        { conditions: [{ type: 'Ready', status: 'False' }] },
      ],
      computed_status: {
        node_warnings: { 'node-1': 'warning' },
      },
    }

    ;(useCluster as jest.Mock).mockReturnValue({
      data: mockCluster,
    })
    ;(useClusterRunningStatus as jest.Mock).mockReturnValue({
      data: runningStatus || defaultRunningStatus,
    })
  }

  it('should render the component with correct structure', () => {
    setupMocks()
    renderWithProviders(<CardNodeUsage organizationId={mockOrganizationId} clusterId={mockClusterId} />)
    expect(screen.getByText('Nodes usages')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should not display min/max for GCP cloud provider', () => {
    setupMocks('GCP')
    renderWithProviders(<CardNodeUsage organizationId={mockOrganizationId} clusterId={mockClusterId} />)
    expect(screen.queryByText('min: 2')).not.toBeInTheDocument()
    expect(screen.queryByText('max: 5')).not.toBeInTheDocument()
  })

  it('should not display min/max for AWS with KARPENTER instance type', () => {
    setupMocks('AWS', 'KARPENTER')
    renderWithProviders(<CardNodeUsage organizationId={mockOrganizationId} clusterId={mockClusterId} />)
    expect(screen.queryByText('min: 2')).not.toBeInTheDocument()
    expect(screen.queryByText('max: 5')).not.toBeInTheDocument()
  })

  it('should display progress bar for AWS non-KARPENTER instance type', () => {
    setupMocks('AWS', 'EC2')
    renderWithProviders(<CardNodeUsage organizationId={mockOrganizationId} clusterId={mockClusterId} />)
    expect(screen.getByText('min: 2')).toBeInTheDocument()
    expect(screen.getByText('max: 5')).toBeInTheDocument()
  })
})
