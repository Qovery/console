import { useClusterRunningStatus } from '@qovery/domains/clusters/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useClusterMetrics } from '../hooks/use-cluster-metrics/use-cluster-metrics'
import { calculateClusterResources } from './calculate-cluster-resources'
import { ClusterCardResources } from './cluster-card-resources'

jest.mock('@qovery/domains/clusters/feature', () => ({
  useClusterRunningStatus: jest.fn(),
}))

jest.mock('../hooks/use-cluster-metrics/use-cluster-metrics', () => ({
  useClusterMetrics: jest.fn(),
}))

jest.mock('./calculate-cluster-resources', () => ({
  calculateClusterResources: jest.fn(),
}))

describe('ClusterCardResources', () => {
  const mockOrganizationId = 'org-123'
  const mockClusterId = 'cluster-456'

  const mockClusterResources = {
    cpu: {
      used: 2.5,
      total: 8,
      percent: 31.25,
      unit: 'vCPU',
    },
    memory: {
      used: 4,
      total: 16,
      percent: 25,
      unit: 'GB',
    },
    disk: {
      used: 50,
      total: 200,
      percent: 26,
      unit: 'GB',
    },
  }

  const defaultRunningStatus = {
    computed_status: {
      node_warnings: { 'node-1': 'warning' },
    },
  }

  const defaultMetrics = {
    nodes: [
      {
        resources_capacity: {
          cpu_milli: 8000,
          memory_mib: 16384,
          ephemeral_storage_mib: 204800,
        },
        resources_allocated: {
          request_cpu_milli: 2500,
          request_memory_mib: 4096,
        },
        metrics_usage: {
          disk_mib_usage: 51200,
        },
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useClusterRunningStatus as jest.Mock).mockReturnValue({
      data: defaultRunningStatus,
    })
    ;(useClusterMetrics as jest.Mock).mockReturnValue({
      data: defaultMetrics,
    })
    ;(calculateClusterResources as jest.Mock).mockReturnValue(mockClusterResources)
  })

  it('should render the component with correct structure', () => {
    renderWithProviders(<ClusterCardResources organizationId={mockOrganizationId} clusterId={mockClusterId} />)

    expect(screen.getByText('Total cluster resources')).toBeInTheDocument()
    expect(screen.getByText('CPU reserved')).toBeInTheDocument()
    expect(screen.getByText('Memory reserved')).toBeInTheDocument()
    expect(screen.getByText('Disk usage')).toBeInTheDocument()
  })

  it('should display the correct CPU resource values', () => {
    renderWithProviders(<ClusterCardResources organizationId={mockOrganizationId} clusterId={mockClusterId} />)

    expect(screen.getByText('2.5')).toBeInTheDocument()
    expect(screen.getByText(/\/8 vCPU/)).toBeInTheDocument()
    expect(screen.getByText('31.25%')).toBeInTheDocument()
  })

  it('should display the correct Memory resource values', () => {
    renderWithProviders(<ClusterCardResources organizationId={mockOrganizationId} clusterId={mockClusterId} />)

    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText(/\/16 GB/)).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument()
  })

  it('should display the correct Disk resource values', () => {
    renderWithProviders(<ClusterCardResources organizationId={mockOrganizationId} clusterId={mockClusterId} />)

    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText(/\/200 GB/)).toBeInTheDocument()
    expect(screen.getByText('26%')).toBeInTheDocument()
  })
})
