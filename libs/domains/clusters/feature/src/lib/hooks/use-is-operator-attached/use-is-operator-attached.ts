import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type Cluster } from 'qovery-typescript-axios'
import { useClusterOperatorStatus } from '../use-cluster-operator-status/use-cluster-operator-status'

// Self-managed clusters may be attached to the Qovery Operator: the Cluster model does not say it,
// only the Operator status does (q-core answers 404 for clusters without Operator state).
export function useIsOperatorAttached(cluster: Pick<Cluster, 'id' | 'organization' | 'kubernetes'>) {
  const isEngineV2Enabled = Boolean(useFeatureFlagEnabled('engine-v2-platform-configuration'))
  const enabled = isEngineV2Enabled && cluster.kubernetes === 'SELF_MANAGED'
  const { data: operatorStatus } = useClusterOperatorStatus({
    organizationId: cluster.organization.id,
    clusterId: cluster.id,
    enabled,
    staleTime: 60_000,
  })

  // A disabled query still exposes cached data, which other views may have fetched without the flag.
  return enabled && Boolean(operatorStatus && operatorStatus.status !== 'NOT_ATTACHED')
}

export default useIsOperatorAttached
