import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type Cluster } from 'qovery-typescript-axios'
import { useClusterOperatorStatus } from '../use-cluster-operator-status/use-cluster-operator-status'

// Self-managed clusters may be attached to the Qovery Operator: the Cluster model does not say it,
// only the Operator status does (q-core answers 404 for clusters without Operator state).
// Undefined until it is known: while the feature flags, the cluster or its Operator status are loading.
export function useIsOperatorAttached(cluster?: Pick<Cluster, 'id' | 'organization' | 'kubernetes'>) {
  const isEngineV2Enabled = useFeatureFlagEnabled('engine-v2-platform-configuration')
  const enabled = Boolean(isEngineV2Enabled) && cluster?.kubernetes === 'SELF_MANAGED'
  const { data: operatorStatus, isLoading } = useClusterOperatorStatus({
    organizationId: cluster?.organization.id ?? '',
    clusterId: cluster?.id ?? '',
    enabled,
    staleTime: 60_000,
  })

  if (isEngineV2Enabled === undefined || !cluster) return undefined
  // A disabled query still exposes cached data, which other views may have fetched without the flag.
  if (!enabled) return false
  if (isLoading) return undefined
  return Boolean(operatorStatus && operatorStatus.status !== 'NOT_ATTACHED')
}

export default useIsOperatorAttached
