import { type ClusterNodeDto, type NodeConditionDto } from 'qovery-ws-typescript-axios'
import { useCluster, useClusterRunningStatus } from '@qovery/domains/clusters/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ClusterTableNodepool } from './cluster-table-nodepool'

jest.mock('@qovery/domains/clusters/feature', () => ({
  useCluster: jest.fn(),
  useClusterRunningStatus: jest.fn(),
}))

interface MockNodePool {
  name: string
  cpu: {
    total: number
    used: number
    reserved: number
  }
  memory: {
    total: number
    used: number
    reserved: number
  }
}

describe('ClusterTableNodepool', () => {
  const mockOrganizationId = 'org-123'
  const mockClusterId = 'cluster-456'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const setupMocks = (
    nodePools: MockNodePool[] = [],
    nodes: ClusterNodeDto[] = [],
    nodeWarnings: Record<string, string> = {}
  ) => {
    const mockRunningStatus = {
      node_pools: nodePools,
      nodes: nodes,
      computed_status: {
        node_warnings: nodeWarnings,
      },
    }

    ;(useClusterRunningStatus as jest.Mock).mockReturnValue({
      data: mockRunningStatus,
    })
  }

  it('should render nothing when there are no nodes', () => {
    setupMocks([], [], {})
    const { container } = renderWithProviders(
      <ClusterTableNodepool organizationId={mockOrganizationId} clusterId={mockClusterId} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('should render node pool with metrics correctly', () => {
    const mockNodePools: MockNodePool[] = [
      {
        name: 'default',
        cpu: { total: 8, used: 4, reserved: 2 },
        memory: { total: 16, used: 8, reserved: 4 },
      },
    ]

    const mockNodes: ClusterNodeDto[] = [
      {
        name: 'node-1',
        labels: {
          'karpenter.sh/nodepool': 'default',
        },
        metrics_usage: {
          cpu_milli_usage: 2000,
          memory_mib_working_set_usage: 4096,
        },
        resources_allocated: {
          request_cpu_milli: 2000,
          request_memory_mib: 4096,
          limit_cpu_milli: 4000,
          limit_memory_mib: 8192,
        },
        resources_capacity: {
          cpu_milli: 4000,
          memory_mib: 8192,
          ephemeral_storage_mib: 20480,
          pods: 110,
        },
        resources_allocatable: {
          cpu_milli: 4000,
          memory_mib: 8192,
          ephemeral_storage_mib: 20480,
          pods: 110,
        },
        conditions: [
          {
            type: 'Ready',
            status: 'True',
            last_heartbeat_time: 1704067200000,
            last_transition_time: 1704067200000,
            message: '',
            reason: '',
          },
        ],
        addresses: [],
        annotations: {},
        architecture: 'amd64',
        created_at: 1704067200000,
        kubelet_version: 'v1.24.0',
        operating_system: 'linux',
        kernel_version: '5.15.0',
        os_image: 'Ubuntu 22.04 LTS',
        pods: [],
        taints: [],
        unschedulable: false,
      },
      {
        name: 'node-2',
        labels: {
          'karpenter.sh/nodepool': 'default',
        },
        metrics_usage: {
          cpu_milli_usage: 2000,
          memory_mib_working_set_usage: 4096,
        },
        resources_allocated: {
          request_cpu_milli: 2000,
          request_memory_mib: 4096,
          limit_cpu_milli: 4000,
          limit_memory_mib: 8192,
        },
        resources_capacity: {
          cpu_milli: 4000,
          memory_mib: 8192,
          ephemeral_storage_mib: 20480,
          pods: 110,
        },
        resources_allocatable: {
          cpu_milli: 4000,
          memory_mib: 8192,
          ephemeral_storage_mib: 20480,
          pods: 110,
        },
        conditions: [
          {
            type: 'Ready',
            status: 'True',
            last_heartbeat_time: 1704067200000,
            last_transition_time: 1704067200000,
            message: '',
            reason: '',
          },
        ],
        addresses: [],
        annotations: {},
        architecture: 'amd64',
        created_at: 1704067200000,
        kubelet_version: 'v1.24.0',
        operating_system: 'linux',
        kernel_version: '5.15.0',
        os_image: 'Ubuntu 22.04 LTS',
        pods: [],
        taints: [],
        unschedulable: false,
      },
    ]

    setupMocks(mockNodePools, mockNodes, {})

    renderWithProviders(<ClusterTableNodepool organizationId={mockOrganizationId} clusterId={mockClusterId} />)

    expect(screen.getByText('Default nodepool')).toBeInTheDocument()
    expect(screen.getByText('4 /8 vCPU')).toBeInTheDocument()
    expect(screen.getByText('8 /16 GB')).toBeInTheDocument()
    expect(screen.getByText('2 nodes')).toBeInTheDocument()
    expect(screen.getByText('RUNNING')).toBeInTheDocument()
  })

  it('should show warning status when nodes have warnings', () => {
    const mockNodePools: MockNodePool[] = [
      {
        name: 'default',
        cpu: { total: 8, used: 4, reserved: 2 },
        memory: { total: 16, used: 8, reserved: 4 },
      },
    ]

    const mockNodes: ClusterNodeDto[] = [
      {
        name: 'node-1',
        labels: {
          'karpenter.sh/nodepool': 'default',
        },
        metrics_usage: {
          cpu_milli_usage: 2000,
          memory_mib_working_set_usage: 4096,
        },
        resources_allocated: {
          request_cpu_milli: 2000,
          request_memory_mib: 4096,
          limit_cpu_milli: 4000,
          limit_memory_mib: 8192,
        },
        resources_capacity: {
          cpu_milli: 4000,
          memory_mib: 8192,
          ephemeral_storage_mib: 20480,
          pods: 110,
        },
        resources_allocatable: {
          cpu_milli: 4000,
          memory_mib: 8192,
          ephemeral_storage_mib: 20480,
          pods: 110,
        },
        conditions: [
          {
            type: 'Ready',
            status: 'True',
            last_heartbeat_time: 1704067200000,
            last_transition_time: 1704067200000,
            message: '',
            reason: '',
          },
        ],
        addresses: [],
        annotations: {},
        architecture: 'amd64',
        created_at: 1704067200000,
        kubelet_version: 'v1.24.0',
        operating_system: 'linux',
        kernel_version: '5.15.0',
        os_image: 'Ubuntu 22.04 LTS',
        pods: [],
        taints: [],
        unschedulable: false,
      },
      {
        name: 'node-2',
        labels: {
          'karpenter.sh/nodepool': 'default',
        },
        metrics_usage: {
          cpu_milli_usage: 2000,
          memory_mib_working_set_usage: 4096,
        },
        resources_allocated: {
          request_cpu_milli: 2000,
          request_memory_mib: 4096,
          limit_cpu_milli: 4000,
          limit_memory_mib: 8192,
        },
        resources_capacity: {
          cpu_milli: 4000,
          memory_mib: 8192,
          ephemeral_storage_mib: 20480,
          pods: 110,
        },
        resources_allocatable: {
          cpu_milli: 4000,
          memory_mib: 8192,
          ephemeral_storage_mib: 20480,
          pods: 110,
        },
        conditions: [
          {
            type: 'Ready',
            status: 'False',
            last_heartbeat_time: 1704067200000,
            last_transition_time: 1704067200000,
            message: 'Node is not ready',
            reason: 'NodeNotReady',
          },
        ],
        addresses: [],
        annotations: {},
        architecture: 'amd64',
        created_at: 1704067200000,
        kubelet_version: 'v1.24.0',
        operating_system: 'linux',
        kernel_version: '5.15.0',
        os_image: 'Ubuntu 22.04 LTS',
        pods: [],
        taints: [],
        unschedulable: false,
      },
    ]

    const mockNodeWarnings = {
      'node-2': 'Node is not ready',
    }

    setupMocks(mockNodePools, mockNodes, mockNodeWarnings)

    renderWithProviders(<ClusterTableNodepool organizationId={mockOrganizationId} clusterId={mockClusterId} />)

    expect(screen.getByText('WARNING')).toBeInTheDocument()
  })
})
