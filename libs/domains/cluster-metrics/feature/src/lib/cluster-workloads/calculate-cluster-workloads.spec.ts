import { type ClusterNodeDto, type NodePodInfoDto } from 'qovery-ws-typescript-axios'
import { calculateClusterWorkloads, sortWorkloads } from './calculate-cluster-workloads'

const createPod = (
  cpu: number,
  memory: number,
  service?: { serviceId: string; environmentId: string },
  overrides: Partial<NodePodInfoDto> = {}
): NodePodInfoDto =>
  ({
    name: `pod-${Math.random()}`,
    namespace: service ? `z-${service.environmentId}` : 'kube-system',
    status_phase: 'RUNNING',
    restart_count: 0,
    created_at: Date.now(),
    cpu_milli_request: cpu,
    memory_mib_request: memory,
    error_container_statuses: [],
    images_version: {},
    metrics_usage: {},
    qovery_service_info: service
      ? {
          service_id: service.serviceId,
          service_name: `${service.serviceId}-name`,
          environment_id: service.environmentId,
          environment_name: `${service.environmentId}-name`,
          project_id: 'project-1',
          project_name: 'Project 1',
        }
      : null,
    ...overrides,
  }) as NodePodInfoDto

const createNode = (cpuCapacity: number, memoryCapacity: number, pods: NodePodInfoDto[]): ClusterNodeDto =>
  ({
    name: 'node',
    resources_capacity: { cpu_milli: cpuCapacity, memory_mib: memoryCapacity, ephemeral_storage_mib: 0, pods: 0 },
    pods,
  }) as unknown as ClusterNodeDto

describe('calculateClusterWorkloads', () => {
  it('returns empty workloads without nodes', () => {
    const result = calculateClusterWorkloads(undefined)

    expect(result.capacity).toEqual({ cpuMilli: 0, memoryMib: 0 })
    expect(result.allocated).toEqual({ cpuMilli: 0, memoryMib: 0, pods: 0 })
    expect(result.environments).toEqual([])
    expect(result.services).toEqual([])
  })

  it('groups pod requests by service and environment across nodes', () => {
    const api = { serviceId: 'api', environmentId: 'prod' }
    const front = { serviceId: 'front', environmentId: 'prod' }
    const worker = { serviceId: 'worker', environmentId: 'staging' }

    const result = calculateClusterWorkloads([
      createNode(4000, 8192, [createPod(500, 512, api), createPod(250, 256, front), createPod(100, 128)]),
      createNode(4000, 8192, [createPod(500, 512, api), createPod(2000, 1024, worker)]),
    ])

    expect(result.capacity).toEqual({ cpuMilli: 8000, memoryMib: 16384 })
    expect(result.allocated).toEqual({ cpuMilli: 3350, memoryMib: 2432, pods: 5 })

    expect(result.environments.map(({ id, cpuMilli, memoryMib, pods }) => ({ id, cpuMilli, memoryMib, pods }))).toEqual(
      [
        { id: 'staging', cpuMilli: 2000, memoryMib: 1024, pods: 1 },
        { id: 'prod', cpuMilli: 1250, memoryMib: 1280, pods: 3 },
      ]
    )
    expect(result.environments[1].services.map(({ id, pods }) => ({ id, pods }))).toEqual([
      { id: 'api', pods: 2 },
      { id: 'front', pods: 1 },
    ])
    expect(result.services.map(({ id }) => id)).toEqual(['worker', 'api', 'front'])
  })

  it('lists the namespaces of each environment, the most used first', () => {
    const api = { serviceId: 'api', environmentId: 'prod' }
    const chart = { serviceId: 'chart', environmentId: 'prod' }

    const result = calculateClusterWorkloads([
      createNode(4000, 8192, [
        createPod(100, 100, api),
        createPod(100, 100, chart, { namespace: 'monitoring' }),
        createPod(100, 100, chart, { namespace: 'monitoring' }),
      ]),
    ])

    expect(result.environments[0].namespaces).toEqual(['monitoring', 'z-prod'])
    expect(result.services.find(({ id }) => id === 'chart')?.namespaces).toEqual(['monitoring'])
    expect(result.services.find(({ id }) => id === 'api')?.namespaces).toEqual(['z-prod'])
  })

  it('puts pods without a Qovery service in the system bucket, grouped by namespace', () => {
    const result = calculateClusterWorkloads([
      createNode(2000, 4096, [
        createPod(100, 100),
        createPod(300, 50, undefined, { namespace: 'qovery' }),
        createPod(50, 20),
      ]),
    ])

    expect(result.system).toMatchObject({ cpuMilli: 450, memoryMib: 170, pods: 3 })
    expect(result.system.namespaces.map(({ name, pods }) => ({ name, pods }))).toEqual([
      { name: 'qovery', pods: 1 },
      { name: 'kube-system', pods: 2 },
    ])
  })

  it('ignores finished pods and missing requests', () => {
    const job = { serviceId: 'job', environmentId: 'prod' }
    const result = calculateClusterWorkloads([
      createNode(1000, 1024, [
        createPod(500, 500, job, { status_phase: 'SUCCEEDED' }),
        createPod(500, 500, job, { status_phase: 'FAILED' }),
        createPod(0, 0, job, { cpu_milli_request: null, memory_mib_request: undefined }),
      ]),
    ])

    expect(result.allocated).toEqual({ cpuMilli: 0, memoryMib: 0, pods: 1 })
    expect(result.services[0]).toMatchObject({ id: 'job', pods: 1 })
  })
})

describe('sortWorkloads', () => {
  const items = [
    { cpuMilli: 100, memoryMib: 900, pods: 1 },
    { cpuMilli: 500, memoryMib: 100, pods: 1 },
  ]

  it('sorts by CPU or memory descending', () => {
    expect(sortWorkloads(items, 'cpu')[0].cpuMilli).toBe(500)
    expect(sortWorkloads(items, 'memory')[0].memoryMib).toBe(900)
  })

  it('breaks ties with the other resource', () => {
    const tied = [
      { cpuMilli: 500, memoryMib: 100, pods: 1 },
      { cpuMilli: 500, memoryMib: 300, pods: 1 },
      { cpuMilli: 200, memoryMib: 300, pods: 1 },
    ]

    expect(sortWorkloads(tied, 'cpu')).toEqual([tied[1], tied[0], tied[2]])
    expect(sortWorkloads(tied, 'memory')).toEqual([tied[1], tied[2], tied[0]])
  })
})
