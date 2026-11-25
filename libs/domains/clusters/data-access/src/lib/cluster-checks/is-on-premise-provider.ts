import { type SelfManagedClusterRequestProviderEnum } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'

type OnPremiseProvider = Exclude<SelfManagedClusterRequestProviderEnum, 'AWS' | 'GCP' | 'SCW'>

export function isOnPremiseProvider(
  cloudProvider: SelfManagedClusterRequestProviderEnum
): cloudProvider is OnPremiseProvider {
  return match(cloudProvider)
    .with('AWS', 'GCP', 'SCW', () => false)
    .with('ON_PREMISE', 'HETZNER', 'OVH', 'CIVO', 'ORACLE', 'IBM', () => true)
    .exhaustive()
}
