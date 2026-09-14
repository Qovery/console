import { useQuery } from '@tanstack/react-query'
import { type DeploymentHistoryActionStatus } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

const ACTIVE_DEPLOYMENT_STATUSES: DeploymentHistoryActionStatus[] = ['QUEUED', 'ONGOING', 'CANCELING', 'EXECUTING']

export interface UseClusterDeploymentLogsProps {
  organizationId: string
  clusterId: string
  deploymentId: string
  refetchInterval?: number | false
  enabled?: boolean
}

export function getClusterDeploymentLogsRefetchInterval(status?: DeploymentHistoryActionStatus): number | false {
  return !status || ACTIVE_DEPLOYMENT_STATUSES.includes(status) ? 3000 : false
}

export function useClusterDeploymentLogs({
  organizationId,
  clusterId,
  deploymentId,
  refetchInterval = false,
  enabled = true,
}: UseClusterDeploymentLogsProps) {
  return useQuery({
    ...queries.clusters.deploymentLogs({ organizationId, clusterId, deploymentId }),
    enabled: enabled && Boolean(organizationId) && Boolean(clusterId) && Boolean(deploymentId),
    refetchInterval,
  })
}

export default useClusterDeploymentLogs
