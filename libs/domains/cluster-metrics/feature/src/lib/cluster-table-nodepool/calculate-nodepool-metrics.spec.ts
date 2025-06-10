import type { ClusterNodeDto, NodePoolInfoDto } from 'qovery-ws-typescript-axios'
import { calculateNodePoolMetrics } from './calculate-nodepool-metrics'

describe('calculateNodePoolMetrics', () => {
  const mockNodes: ClusterNodeDto[] = [
    {
      name: 'node-1',
      labels: {
        'karpenter.sh/nodepool': 'default',
      },
      metrics_usage: {
        cpu_milli_usage: 1000,
        memory_mib_working_set_usage: 512,
      },
      resources_allocated: {
        request_cpu_milli: 1000,
        request_memory_mib: 512,
        limit_cpu_milli: 2000,
        limit_memory_mib: 1024,
      },
      resources_capacity: {
        cpu_milli: 2000,
        memory_mib: 1024,
        ephemeral_storage_mib: 20480,
        pods: 110,
      },
      resources_allocatable: {
        cpu_milli: 2000,
        memory_mib: 1024,
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
        cpu_milli_usage: 500,
        memory_mib_working_set_usage: 256,
      },
      resources_allocated: {
        request_cpu_milli: 500,
        request_memory_mib: 256,
        limit_cpu_milli: 1000,
        limit_memory_mib: 512,
      },
      resources_capacity: {
        cpu_milli: 1000,
        memory_mib: 512,
        ephemeral_storage_mib: 10240,
        pods: 110,
      },
      resources_allocatable: {
        cpu_milli: 1000,
        memory_mib: 512,
        ephemeral_storage_mib: 10240,
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
      name: 'node-3',
      labels: {
        'karpenter.sh/nodepool': 'stable',
      },
      metrics_usage: {
        cpu_milli_usage: 2000,
        memory_mib_working_set_usage: 1024,
      },
      resources_allocated: {
        request_cpu_milli: 2000,
        request_memory_mib: 1024,
        limit_cpu_milli: 4000,
        limit_memory_mib: 2048,
      },
      resources_capacity: {
        cpu_milli: 4000,
        memory_mib: 2048,
        ephemeral_storage_mib: 40960,
        pods: 110,
      },
      resources_allocatable: {
        cpu_milli: 4000,
        memory_mib: 2048,
        ephemeral_storage_mib: 40960,
        pods: 110,
      },
      conditions: [
        {
          type: 'Ready',
          status: 'False',
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

  const mockNodeWarnings = {
    'node-1': { message: 'Warning message' },
  }

  const mockNodePool: NodePoolInfoDto = {
    name: 'default',
    cpu_milli: 2000,
    cpu_milli_limit: 3000,
    memory_mib: 1024,
    memory_mib_limit: 2048,
    nodes_count: 2,
  }

  const mockNonExistentNodePool: NodePoolInfoDto = {
    name: 'non-existent',
    cpu_milli: 0,
    cpu_milli_limit: 0,
    memory_mib: 0,
    memory_mib_limit: 0,
    nodes_count: 0,
  }

  const mockStableNodePool: NodePoolInfoDto = {
    name: 'stable',
    cpu_milli: 2000,
    cpu_milli_limit: 4000,
    memory_mib: 1024,
    memory_mib_limit: 2048,
    nodes_count: 1,
  }

  it('should calculate metrics for a specific node pool', () => {
    const result = calculateNodePoolMetrics(mockNodePool, mockNodes, mockNodeWarnings)

    expect(result).toEqual({
      cpuUsed: 2,
      cpuTotal: 3,
      cpuReserved: 2,
      memoryUsed: 1,
      memoryTotal: 2,
      memoryReserved: 1,
      nodesCount: 2,
      nodesWarningCount: 1,
      nodesDeployingCount: 0,
    })
  })

  it('should handle empty node pool', () => {
    const result = calculateNodePoolMetrics(mockNonExistentNodePool, mockNodes, {})

    expect(result).toEqual({
      cpuUsed: 0,
      cpuTotal: 0,
      cpuReserved: 0,
      memoryUsed: 0,
      memoryTotal: 0,
      memoryReserved: 0,
      nodesCount: 0,
      nodesWarningCount: 0,
      nodesDeployingCount: 0,
    })
  })

  it('should handle nodes with missing resource information', () => {
    const nodesWithMissingInfo: ClusterNodeDto[] = [
      {
        name: 'node-4',
        labels: {
          'karpenter.sh/nodepool': 'default',
        },
        metrics_usage: {},
        resources_allocated: {
          request_cpu_milli: 0,
          request_memory_mib: 0,
          limit_cpu_milli: 0,
          limit_memory_mib: 0,
        },
        resources_capacity: {
          cpu_milli: 0,
          memory_mib: 0,
          ephemeral_storage_mib: 0,
          pods: 0,
        },
        resources_allocatable: {
          cpu_milli: 0,
          memory_mib: 0,
          ephemeral_storage_mib: 0,
          pods: 0,
        },
        conditions: [],
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

    const result = calculateNodePoolMetrics(mockNodePool, nodesWithMissingInfo, {})

    expect(result).toEqual({
      cpuUsed: 0,
      cpuTotal: 3,
      cpuReserved: 2,
      memoryUsed: 0,
      memoryTotal: 2,
      memoryReserved: 1,
      nodesCount: 1,
      nodesWarningCount: 0,
      nodesDeployingCount: 0,
    })
  })

  it('should count deploying nodes correctly', () => {
    const result = calculateNodePoolMetrics(mockStableNodePool, mockNodes, {})

    expect(result).toEqual({
      cpuUsed: 2,
      cpuTotal: 4,
      cpuReserved: 2,
      memoryUsed: 1,
      memoryTotal: 2,
      memoryReserved: 1,
      nodesCount: 1,
      nodesWarningCount: 0,
      nodesDeployingCount: 1,
    })
  })

  it('should handle null cpu_milli_limit', () => {
    const mockNodePoolWithNullLimit: NodePoolInfoDto = {
      name: 'default',
      cpu_milli: 2000,
      cpu_milli_limit: null,
      memory_mib: 1024,
      memory_mib_limit: 2048,
      nodes_count: 2,
    }

    const result = calculateNodePoolMetrics(mockNodePoolWithNullLimit, mockNodes, mockNodeWarnings)

    expect(result).toEqual({
      cpuUsed: 2,
      cpuTotal: null,
      cpuReserved: 2,
      memoryUsed: 1,
      memoryTotal: 2,
      memoryReserved: 1,
      nodesCount: 2,
      nodesWarningCount: 1,
      nodesDeployingCount: 0,
    })
  })
})
