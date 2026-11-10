import { useParams } from '@tanstack/react-router'
import { useModal } from '@qovery/shared/ui'
import { ClusterWideCredentialsTrustPolicyModal } from '../../cluster-credentials-settings/cluster-wide-credentials-trust-policy-modal'
import { getWideCredentialsTrustPolicy } from '../../utils/get-wide-credentials-trust-policy'
import { useClusterStatus } from '../use-cluster-status/use-cluster-status'
import { useCluster } from '../use-cluster/use-cluster'

export function useWideCredentialsInstructions() {
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const { data: cluster } = useCluster({ organizationId, clusterId })
  const requireWideAccessToDeploy = cluster?.wide_permissions?.require_wide_access_to_deploy === true
  const { data: clusterStatus, isSuccess } = useClusterStatus({
    organizationId,
    clusterId,
    enabled: Boolean(organizationId) && Boolean(clusterId) && requireWideAccessToDeploy,
    refetchInterval: 4_000,
  })
  const { openModal } = useModal()

  return {
    isRequired:
      requireWideAccessToDeploy && isSuccess && Boolean(clusterStatus?.status) && clusterStatus?.status !== 'DEPLOYING',
    openInstructions: () =>
      openModal({
        content: <ClusterWideCredentialsTrustPolicyModal trustPolicy={getWideCredentialsTrustPolicy(organizationId)} />,
        options: { width: 680, className: 'max-w-[calc(100vw-32px)]' },
      }),
  }
}
