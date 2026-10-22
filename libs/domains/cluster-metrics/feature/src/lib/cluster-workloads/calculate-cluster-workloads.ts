import { type ClusterNodeDto, type NodePodInfoDto } from 'qovery-ws-typescript-axios'

export interface WorkloadResources {
  cpuMilli: number
  memoryMib: number
  pods: number
}

export interface ServiceWorkload extends WorkloadResources {
  id: string
  name: string
  environmentId: string
  environmentName: string
  projectId: string
  projectName: string
  // Kubernetes namespaces the service's pods run in, the one with the most pods first
  namespaces: string[]
}

export interface EnvironmentWorkload extends WorkloadResources {
  id: string
  name: string
  projectId: string
  projectName: string
  // Kubernetes namespaces the environment's pods run in, the one with the most pods first
  namespaces: string[]
  services: ServiceWorkload[]
}

export interface NamespaceWorkload extends WorkloadResources {
  name: string
}

export interface ClusterWorkloads {
  capacity: { cpuMilli: number; memoryMib: number }
  allocated: WorkloadResources
  environments: EnvironmentWorkload[]
  services: ServiceWorkload[]
  // Pods not linked to a Qovery service (Kubernetes system, add-ons, Qovery agents...)
  system: WorkloadResources & { namespaces: NamespaceWorkload[] }
}

export type WorkloadSortKey = 'cpu' | 'memory'

// Succeeded and failed pods no longer hold their requests on the node
const isActivePod = (pod: NodePodInfoDto) => pod.status_phase !== 'SUCCEEDED' && pod.status_phase !== 'FAILED'

const emptyResources = (): WorkloadResources => ({ cpuMilli: 0, memoryMib: 0, pods: 0 })

const addPod = (target: WorkloadResources, pod: NodePodInfoDto) => {
  target.cpuMilli += pod.cpu_milli_request ?? 0
  target.memoryMib += pod.memory_mib_request ?? 0
  target.pods += 1
}

const countNamespace = (counts: Map<string, Map<string, number>>, id: string, namespace: string) => {
  const podsByNamespace = counts.get(id) ?? new Map<string, number>()
  podsByNamespace.set(namespace, (podsByNamespace.get(namespace) ?? 0) + 1)
  counts.set(id, podsByNamespace)
}

const namespacesByPods = (counts: Map<string, Map<string, number>>, id: string) =>
  [...(counts.get(id) ?? new Map<string, number>())].sort(([, a], [, b]) => b - a).map(([name]) => name)

export const sortWorkloads = <T extends WorkloadResources>(items: T[], sortKey: WorkloadSortKey): T[] =>
  [...items].sort((a, b) =>
    sortKey === 'cpu'
      ? b.cpuMilli - a.cpuMilli || b.memoryMib - a.memoryMib
      : b.memoryMib - a.memoryMib || b.cpuMilli - a.cpuMilli
  )

export function calculateClusterWorkloads(nodes: ClusterNodeDto[] = []): ClusterWorkloads {
  const capacity = { cpuMilli: 0, memoryMib: 0 }
  const allocated = emptyResources()
  const environments = new Map<string, EnvironmentWorkload>()
  const services = new Map<string, ServiceWorkload>()
  const system = { ...emptyResources(), namespaces: [] as NamespaceWorkload[] }
  const namespaces = new Map<string, NamespaceWorkload>()
  const environmentNamespaces = new Map<string, Map<string, number>>()
  const serviceNamespaces = new Map<string, Map<string, number>>()

  for (const node of nodes) {
    capacity.cpuMilli += node.resources_capacity.cpu_milli
    capacity.memoryMib += node.resources_capacity.memory_mib

    for (const pod of node.pods ?? []) {
      if (!isActivePod(pod)) continue
      addPod(allocated, pod)

      const info = pod.qovery_service_info
      if (!info) {
        addPod(system, pod)
        let namespace = namespaces.get(pod.namespace)
        if (!namespace) {
          namespace = { name: pod.namespace, ...emptyResources() }
          namespaces.set(pod.namespace, namespace)
        }
        addPod(namespace, pod)
        continue
      }

      let environment = environments.get(info.environment_id)
      if (!environment) {
        environment = {
          id: info.environment_id,
          name: info.environment_name,
          projectId: info.project_id,
          projectName: info.project_name,
          namespaces: [],
          services: [],
          ...emptyResources(),
        }
        environments.set(info.environment_id, environment)
      }
      addPod(environment, pod)

      countNamespace(environmentNamespaces, info.environment_id, pod.namespace)
      countNamespace(serviceNamespaces, info.service_id, pod.namespace)

      let service = services.get(info.service_id)
      if (!service) {
        service = {
          id: info.service_id,
          name: info.service_name,
          environmentId: info.environment_id,
          environmentName: info.environment_name,
          projectId: info.project_id,
          projectName: info.project_name,
          namespaces: [],
          ...emptyResources(),
        }
        services.set(info.service_id, service)
        environment.services.push(service)
      }
      addPod(service, pod)
    }
  }

  system.namespaces = sortWorkloads([...namespaces.values()], 'cpu')
  // Services are shared by reference between the environments and the flat list
  for (const service of services.values()) {
    service.namespaces = namespacesByPods(serviceNamespaces, service.id)
  }

  return {
    capacity,
    allocated,
    environments: sortWorkloads([...environments.values()], 'cpu').map((environment) => ({
      ...environment,
      namespaces: namespacesByPods(environmentNamespaces, environment.id),
      services: sortWorkloads(environment.services, 'cpu'),
    })),
    services: sortWorkloads([...services.values()], 'cpu'),
    system,
  }
}
