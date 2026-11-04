import { useNavigate, useParams } from '@tanstack/react-router'
import { Modal } from '@qovery/shared/ui'
import { ClusterOperatorInstallInstructions } from '../cluster-operator-install-instructions/cluster-operator-install-instructions'
import {
  OPERATOR_STATUS_REFRESH_INTERVAL,
  useClusterOperatorStatus,
} from '../hooks/use-cluster-operator-status/use-cluster-operator-status'

export function ClusterOperatorInstallModal() {
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const navigate = useNavigate()
  const { data: operatorStatus } = useClusterOperatorStatus({
    organizationId,
    clusterId,
    refetchInterval: OPERATOR_STATUS_REFRESH_INTERVAL,
    stopPollingWhenMissing: true,
    stopPollingOnceInstalled: true,
  })

  return (
    <Modal
      externalOpen={Boolean(operatorStatus && !operatorStatus.last_heartbeat)}
      setExternalOpen={() => navigate({ to: '/organization/$organizationId/clusters', params: { organizationId } })}
    >
      <ClusterOperatorInstallInstructions organizationId={organizationId} clusterId={clusterId} />
    </Modal>
  )
}
