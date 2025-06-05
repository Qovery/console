import { useCluster, useClusterRunningStatus } from '@qovery/domains/clusters/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useClusterMetrics } from '../hooks/use-cluster-metrics/use-cluster-metrics'
import { ClusterTableNodepool } from './cluster-table-nodepool'

jest.mock('@qovery/domains/clusters/feature', () => ({
  useCluster: jest.fn(),
  useClusterRunningStatus: jest.fn(),
}))

jest.mock('../hooks/use-cluster-metrics/use-cluster-metrics', () => ({
  useClusterMetrics: jest.fn(),
}))

describe('ClusterTableNodepool', () => {
  it('should render node pool with metrics correctly', () => {
    const mockMetrics = {
      node_pools: [
        {
          name: 'default',
          cpu_milli: 4000,
          cpu_milli_limit: 8000,
          memory_mib: 8192,
          memory_mib_limit: 16384,
          nodes_count: 2,
        },
      ],
      nodes: [
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
      ],
    }

    const mockRunningStatus = {
      computed_status: {
        node_warnings: {},
      },
    }

    ;(useClusterMetrics as jest.Mock).mockReturnValue({
      data: mockMetrics,
    })
    ;(useClusterRunningStatus as jest.Mock).mockReturnValue({
      data: mockRunningStatus,
    })
    ;(useCluster as jest.Mock).mockReturnValue({
      data: {
        cloud_provider: 'AWS',
      },
    })

    renderWithProviders(<ClusterTableNodepool organizationId="org-123" clusterId="cluster-456" />)

    expect(screen.getByText('Default nodepool')).toBeInTheDocument()

    expect(screen.getByText(/vCPU/)).toBeInTheDocument()
    expect(screen.getByText(/GB/)).toBeInTheDocument()
    expect(screen.getByText('nodes')).toBeInTheDocument()
  })
})
