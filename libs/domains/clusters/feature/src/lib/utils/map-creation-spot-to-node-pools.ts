import { type KarpenterData } from '@qovery/shared/interfaces'

type KarpenterNodePools = KarpenterData['qovery_node_pools']

/**
 * The creation flow exposes a single cluster-wide spot button, which maps to explicit per-nodepool
 * values: the stable nodepool always stays on-demand because it hosts interruption-sensitive
 * workloads, while the default and cronjob nodepools follow the button. The cronjob override is only
 * touched when it already exists, since its presence is what enables the cronjob nodepool. GPU keeps
 * its own dedicated toggle.
 */
export function mapCreationSpotToNodePools(
  spotEnabled: boolean,
  qoveryNodePools?: KarpenterNodePools
): KarpenterNodePools {
  const cronjobOverride = qoveryNodePools?.cronjob_override

  return {
    ...qoveryNodePools,
    requirements: qoveryNodePools?.requirements ?? [],
    default_override: {
      ...qoveryNodePools?.default_override,
      spot_enabled: spotEnabled,
    },
    stable_override: {
      ...qoveryNodePools?.stable_override,
      spot_enabled: false,
    },
    ...(cronjobOverride && {
      cronjob_override: {
        ...cronjobOverride,
        spot_enabled: spotEnabled,
      },
    }),
  }
}
