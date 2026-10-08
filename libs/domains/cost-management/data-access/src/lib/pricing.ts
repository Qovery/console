import { type ServiceResources } from './types'

/**
 * PROTOTYPE pricing table — monthly USD rates.
 *
 * Calibrated against spot-backed EKS node pricing so the estimates land in a
 * believable range for a demo. A real implementation would derive these from the
 * cluster's instance types and the cloud provider's price list.
 */
export const MONTHLY_RATES = {
  perVcpu: 12,
  perRamGib: 1.6,
  perStorageGib: 0.1,
  perGpu: 340,
  perManagedDatabase: 15,
  perLoadBalancer: 18,
} as const

/** Monthly cost of one instance of a service. Scales with the instance count. */
export function monthlyCostPerInstance(resources: ServiceResources): number {
  const { cpuMilli, ramMib, gpu = 0 } = resources

  return (
    (cpuMilli / 1000) * MONTHLY_RATES.perVcpu + (ramMib / 1024) * MONTHLY_RATES.perRamGib + gpu * MONTHLY_RATES.perGpu
  )
}

/** Monthly cost of the add-ons a service carries whatever its instance count. */
export function flatMonthlyCost(resources: ServiceResources): number {
  const { storageGib = 0, managedDatabases = 0, loadBalancers = 0 } = resources

  return (
    storageGib * MONTHLY_RATES.perStorageGib +
    managedDatabases * MONTHLY_RATES.perManagedDatabase +
    loadBalancers * MONTHLY_RATES.perLoadBalancer
  )
}

/** Monthly cost of a service's full footprint. */
export function estimateMonthlyCost(resources: ServiceResources): number {
  return monthlyCostPerInstance(resources) * resources.instances + flatMonthlyCost(resources)
}
