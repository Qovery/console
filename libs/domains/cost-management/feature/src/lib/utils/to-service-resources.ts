import { type ServiceResources } from '@qovery/domains/cost-management/data-access'

/**
 * The resource fields a Qovery service exposes, whatever its type.
 *
 * Typed loosely on purpose: it keeps the cost domain from depending on the
 * services domain, and every caller already holds these values.
 */
export interface ResourceLike {
  cpu?: number | null
  memory?: number | null
  gpu?: number | null
  max_running_instances?: number | null
  storage_gib?: number | null
}

export type ServiceAddOns = Pick<ServiceResources, 'storageGib' | 'managedDatabases' | 'loadBalancers'>

export function toServiceResources(resource: ResourceLike, addOns: ServiceAddOns = {}): ServiceResources {
  return {
    cpuMilli: Number(resource.cpu ?? 0),
    ramMib: Number(resource.memory ?? 0),
    gpu: Number(resource.gpu ?? 0),
    instances: Number(resource.max_running_instances ?? 1),
    storageGib: Number(resource.storage_gib ?? 0),
    ...addOns,
  }
}
