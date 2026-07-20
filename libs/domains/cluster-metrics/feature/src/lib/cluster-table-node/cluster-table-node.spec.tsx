import { type NodePoolInfoDto } from 'qovery-ws-typescript-axios'
import { useClusterRunningStatus } from '@qovery/domains/clusters/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useClusterMetrics } from '../hooks/use-cluster-metrics/use-cluster-metrics'
import { ClusterTableNode } from './cluster-table-node'

jest.mock('@qovery/domains/clusters/feature', () => ({
  useClusterRunningStatus: jest.fn(),
}))

jest.mock('../hooks/use-cluster-metrics/use-cluster-metrics', () => ({
  useClusterMetrics: jest.fn(),
}))

describe('ClusterTableNode', () => {
  const mockOrganizationId = 'org-123'
  const mockClusterId = 'cluster-456'
  const mockNodePool: NodePoolInfoDto = {
    name: 'default',
    cpu_milli: 4000,
    memory_mib: 8192,
    nodes_count: 1,
  }
  const mockRunningStatus = {
    computed_status: {
      node_warnings: {},
    },
  }
  const mockUseClusterRunningStatus = useClusterRunningStatus as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseClusterRunningStatus.mockReturnValue({
      data: mockRunningStatus,
    })
  })

  it('should render nodes with metrics correctly', () => {
    const mockMetrics = {
      nodes: [
        {
          name: 'node-1',
          labels: {
            'karpenter.sh/nodepool': 'default',
            'karpenter.sh/capacity-type': 'on-demand',
          },
          metrics_usage: {
            cpu_milli_usage: 2000,
            memory_mib_working_set_usage: 4096,
            disk_mib_usage: 10240,
          },
          resources_allocated: {
            request_cpu_milli: 2000,
            request_memory_mib: 4096,
          },
          resources_allocatable: {
            cpu_milli: 4000,
            memory_mib: 8192,
          },
          resources_capacity: {
            ephemeral_storage_mib: 20480,
          },
          instance_type: 't3_medium',
          created_at: '2024-01-01T00:00:00Z',
          conditions: [
            {
              type: 'Ready',
              status: 'True',
            },
          ],
        },
      ],
    }

    const mockUseClusterMetrics = useClusterMetrics as jest.Mock
    mockUseClusterMetrics.mockReturnValue({
      data: mockMetrics,
    })

    renderWithProviders(
      <ClusterTableNode organizationId={mockOrganizationId} clusterId={mockClusterId} nodePool={mockNodePool} />
    )

    expect(screen.getByText('node-1')).toBeInTheDocument()
    expect(screen.getByText('t3 medium')).toBeInTheDocument()

    const cpuUsage = screen.getAllByText('50%')[0]
    const memoryUsage = screen.getAllByText('50%')[1]
    expect(cpuUsage).toBeInTheDocument()
    expect(memoryUsage).toBeInTheDocument()
  })

  it('should show warning status when node has warnings', () => {
    const mockMetrics = {
      nodes: [
        {
          name: 'node-1',
          labels: {
            'karpenter.sh/nodepool': 'default',
          },
          metrics_usage: {
            cpu_milli_usage: 2000,
            memory_mib_working_set_usage: 4096,
            disk_mib_usage: 10240,
          },
          resources_allocated: {
            request_cpu_milli: 2000,
            request_memory_mib: 4096,
          },
          resources_allocatable: {
            cpu_milli: 4000,
            memory_mib: 8192,
          },
          resources_capacity: {
            ephemeral_storage_mib: 20480,
          },
          instance_type: 't3_medium',
          created_at: '2024-01-01T00:00:00Z',
          conditions: [
            {
              type: 'Ready',
              status: 'True',
            },
          ],
        },
      ],
    }

    mockUseClusterRunningStatus.mockReturnValue({
      data: {
        computed_status: {
          node_warnings: {
            'node-1': 'Node is not ready',
          },
        },
      },
    })

    const mockUseClusterMetrics = useClusterMetrics as jest.Mock
    mockUseClusterMetrics.mockReturnValue({
      data: mockMetrics,
    })

    renderWithProviders(
      <ClusterTableNode organizationId={mockOrganizationId} clusterId={mockClusterId} nodePool={mockNodePool} />
    )

    const nodeRow = screen.getByText('node-1').closest('div[class*="bg-surface-warning-subtle"]')
    expect(nodeRow).toBeInTheDocument()
  })

  it('should show disk pressure warning when node has disk pressure condition', () => {
    const mockMetrics = {
      nodes: [
        {
          name: 'node-1',
          labels: {
            'karpenter.sh/nodepool': 'default',
          },
          metrics_usage: {
            cpu_milli_usage: 2000,
            memory_mib_working_set_usage: 4096,
            disk_mib_usage: 10240,
          },
          resources_allocated: {
            request_cpu_milli: 2000,
            request_memory_mib: 4096,
          },
          resources_allocatable: {
            cpu_milli: 4000,
            memory_mib: 8192,
          },
          resources_capacity: {
            ephemeral_storage_mib: 20480,
          },
          instance_type: 't3_medium',
          created_at: '2024-01-01T00:00:00Z',
          conditions: [
            {
              type: 'DiskPressure',
              status: 'True',
            },
          ],
        },
      ],
    }

    const mockUseClusterMetrics = useClusterMetrics as jest.Mock
    mockUseClusterMetrics.mockReturnValue({
      data: mockMetrics,
    })

    renderWithProviders(
      <ClusterTableNode organizationId={mockOrganizationId} clusterId={mockClusterId} nodePool={mockNodePool} />
    )

    expect(screen.getByText('20 GB')).toBeInTheDocument()
  })

  it('should show Deploying status when node has not reported any condition yet', () => {
    const mockMetrics = {
      nodes: [
        {
          name: 'node-1',
          labels: {
            'karpenter.sh/nodepool': 'default',
          },
          metrics_usage: {
            cpu_milli_usage: 2000,
            memory_mib_working_set_usage: 4096,
            disk_mib_usage: 10240,
          },
          resources_allocated: {
            request_cpu_milli: 2000,
            request_memory_mib: 4096,
          },
          resources_allocatable: {
            cpu_milli: 4000,
            memory_mib: 8192,
          },
          resources_capacity: {
            ephemeral_storage_mib: 20480,
          },
          instance_type: 't3_medium',
          created_at: '2024-01-01T00:00:00Z',
          conditions: [],
        },
      ],
    }

    const mockUseClusterMetrics = useClusterMetrics as jest.Mock
    mockUseClusterMetrics.mockReturnValue({
      data: mockMetrics,
    })

    renderWithProviders(
      <ClusterTableNode organizationId={mockOrganizationId} clusterId={mockClusterId} nodePool={mockNodePool} />
    )

    const nodeRow = screen.getByText('node-1').closest('div[class*="bg-surface-brand-subtle"]')
    expect(nodeRow).toBeInTheDocument()
  })

  it('should show NotReady status (not Deploying) when node reported Ready=False and is not being removed', () => {
    const mockMetrics = {
      nodes: [
        {
          name: 'node-1',
          labels: {
            'karpenter.sh/nodepool': 'default',
          },
          metrics_usage: {
            cpu_milli_usage: 2000,
            memory_mib_working_set_usage: 4096,
            disk_mib_usage: 10240,
          },
          resources_allocated: {
            request_cpu_milli: 2000,
            request_memory_mib: 4096,
          },
          resources_allocatable: {
            cpu_milli: 4000,
            memory_mib: 8192,
          },
          resources_capacity: {
            ephemeral_storage_mib: 20480,
          },
          instance_type: 't3_medium',
          created_at: '2024-01-01T00:00:00Z',
          conditions: [
            {
              type: 'Ready',
              status: 'False',
            },
          ],
        },
      ],
    }

    const mockUseClusterMetrics = useClusterMetrics as jest.Mock
    mockUseClusterMetrics.mockReturnValue({
      data: mockMetrics,
    })

    renderWithProviders(
      <ClusterTableNode organizationId={mockOrganizationId} clusterId={mockClusterId} nodePool={mockNodePool} />
    )

    expect(screen.getByText('node-1').closest('div[class*="bg-surface-warning-subtle"]')).toBeInTheDocument()
    expect(screen.getByText('node-1').closest('div[class*="bg-surface-brand-subtle"]')).not.toBeInTheDocument()
  })

  it('should show Removing status when node is unschedulable, even without a Ready condition', () => {
    const mockMetrics = {
      nodes: [
        {
          name: 'node-1',
          labels: {
            'karpenter.sh/nodepool': 'default',
          },
          metrics_usage: {
            cpu_milli_usage: 2000,
            memory_mib_working_set_usage: 4096,
            disk_mib_usage: 10240,
          },
          resources_allocated: {
            request_cpu_milli: 2000,
            request_memory_mib: 4096,
          },
          resources_allocatable: {
            cpu_milli: 4000,
            memory_mib: 8192,
          },
          resources_capacity: {
            ephemeral_storage_mib: 20480,
          },
          instance_type: 't3_medium',
          created_at: '2024-01-01T00:00:00Z',
          unschedulable: true,
          conditions: [
            {
              type: 'Ready',
              status: 'False',
            },
          ],
        },
      ],
    }

    const mockUseClusterMetrics = useClusterMetrics as jest.Mock
    mockUseClusterMetrics.mockReturnValue({
      data: mockMetrics,
    })

    renderWithProviders(
      <ClusterTableNode organizationId={mockOrganizationId} clusterId={mockClusterId} nodePool={mockNodePool} />
    )

    expect(screen.getByText('node-1').closest('div[class*="bg-surface-brand-subtle"]')).not.toBeInTheDocument()
    expect(screen.getByText('node-1').closest('div[class*="bg-surface-warning-subtle"]')).not.toBeInTheDocument()
  })
})
