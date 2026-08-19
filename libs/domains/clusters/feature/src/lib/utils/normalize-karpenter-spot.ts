import { type KarpenterData } from '@qovery/shared/interfaces'

type KarpenterNodePools = KarpenterData['qovery_node_pools']

export interface NormalizeKarpenterSpotParams {
  spot_enabled?: boolean
  qovery_node_pools?: KarpenterNodePools
}

/**
 * Clusters created before the per-nodepool spot migration have no explicit spot flag on their
 * nodepools: an absent value falls back to the deprecated cluster-wide one. The cronjob override is
 * only normalized when it already exists, since its presence is what enables the cronjob nodepool.
 */
export function normalizeKarpenterSpot({
  spot_enabled,
  qovery_node_pools,
}: NormalizeKarpenterSpotParams): KarpenterNodePools {
  const globalSpotEnabled = spot_enabled ?? false
  const cronjobOverride = qovery_node_pools?.cronjob_override

  return {
    ...qovery_node_pools,
    requirements: qovery_node_pools?.requirements ?? [],
    default_override: {
      ...qovery_node_pools?.default_override,
      spot_enabled: qovery_node_pools?.default_override?.spot_enabled ?? globalSpotEnabled,
    },
    stable_override: {
      ...qovery_node_pools?.stable_override,
      spot_enabled: qovery_node_pools?.stable_override?.spot_enabled ?? globalSpotEnabled,
    },
    ...(cronjobOverride && {
      cronjob_override: {
        ...cronjobOverride,
        spot_enabled: cronjobOverride.spot_enabled ?? globalSpotEnabled,
      },
    }),
  }
}
