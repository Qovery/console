import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import { BlockContent, InputSelect } from '@qovery/shared/ui'

export const CLUSTER_ZONES_COUNT_FEATURE_FLAG = 'cluster-zones-count'

const ZONES_COUNT_OPTIONS = [
  { label: '3 zones (default)', value: '3' },
  { label: '2 zones', value: '2' },
  { label: '1 zone', value: '1' },
]

export function supportsFewerZones(
  cloudProvider: CloudProviderEnum | undefined,
  isKarpenterEnabled: boolean | undefined
): boolean {
  if (cloudProvider === 'AWS') return Boolean(isKarpenterEnabled)
  return cloudProvider === 'AZURE' || cloudProvider === 'SCW'
}

export interface ClusterZonesCountSettingProps {
  cloudProvider?: CloudProviderEnum
  isProduction?: boolean
}

/**
 * Number of availability zones the cluster nodes run in (`cluster.zones_count`). Hidden behind a PostHog feature flag
 * while the setting is tested; not offered on production clusters, which must run in 3 zones.
 */
export function ClusterZonesCountSetting({ cloudProvider, isProduction }: ClusterZonesCountSettingProps) {
  const isFeatureFlagEnabled = Boolean(useFeatureFlagEnabled(CLUSTER_ZONES_COUNT_FEATURE_FLAG))
  const { control, watch } = useFormContext<ClusterResourcesData>()
  const isKarpenterEnabled = watch('karpenter.enabled')

  if (!isFeatureFlagEnabled || isProduction || !supportsFewerZones(cloudProvider, isKarpenterEnabled)) {
    return null
  }

  return (
    <BlockContent title="Availability zones" className="mb-0">
      <Controller
        name="zones_count"
        control={control}
        defaultValue="3"
        render={({ field }) => (
          <div>
            <InputSelect
              label="Number of availability zones"
              value={field.value}
              onChange={field.onChange}
              options={ZONES_COUNT_OPTIONS}
            />
            <p className="ml-3 mt-1 text-xs text-neutral-subtle">
              Nodes run in fewer zones of the region, which lowers NAT gateway and cross-zone costs. A zone outage then
              takes the cluster down. It cannot be changed after the first deployment.
            </p>
          </div>
        )}
      />
    </BlockContent>
  )
}

export default ClusterZonesCountSetting
