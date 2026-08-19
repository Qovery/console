import { type KarpenterData } from '@qovery/shared/interfaces'

type KarpenterNodePools = KarpenterData['qovery_node_pools']

/**
 * The cluster-wide `spot_enabled` is a deprecated alias kept for legacy readers: it is the OR of the
 * default, stable and cronjob nodepool flags. Nodepools without an explicit flag do not contribute.
 */
export function deriveGlobalSpotEnabled(qoveryNodePools?: KarpenterNodePools): boolean {
  return [
    qoveryNodePools?.default_override?.spot_enabled,
    qoveryNodePools?.stable_override?.spot_enabled,
    qoveryNodePools?.cronjob_override?.spot_enabled,
  ].some((spotEnabled) => spotEnabled === true)
}
