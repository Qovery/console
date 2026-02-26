import type { ClusterRegion } from 'qovery-typescript-axios'

/**
 * Extended ClusterRegion that includes availability zones.
 *
 * The upstream `qovery-typescript-axios` client will include the `zones`
 * field once regenerated from the updated OpenAPI spec.  Until then, this
 * type provides forward-compatible access to the property that the API
 * already returns.
 *
 * Remove this file after updating `qovery-typescript-axios` to a version
 * that includes `zones` on `ClusterRegion`.
 */
export interface ClusterRegionWithZones extends ClusterRegion {
  zones?: string[]
}
