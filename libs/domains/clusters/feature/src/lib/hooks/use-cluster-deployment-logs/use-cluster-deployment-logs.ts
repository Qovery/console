import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseClusterDeploymentLogsProps {
  organizationId: string
  clusterId: string
  deploymentId: string
  refetchInterval?: number
}

export function useClusterDeploymentLogs({
  organizationId,
  clusterId,
  deploymentId,
  refetchInterval = 3000,
}: UseClusterDeploymentLogsProps) {
  return useQuery({
    ...queries.clusters.deploymentLogs({ organizationId, clusterId, deploymentId }),
    enabled: Boolean(organizationId) && Boolean(clusterId) && Boolean(deploymentId),
    refetchInterval,
  })
}

export default useClusterDeploymentLogs
