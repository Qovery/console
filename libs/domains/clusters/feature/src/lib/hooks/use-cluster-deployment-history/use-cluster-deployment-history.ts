import { useQuery } from '@tanstack/react-query'
import { type ClusterDeploymentHistory } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

type RefetchInterval = number | false | ((data: ClusterDeploymentHistory[] | undefined) => number | false)

export interface UseClusterDeploymentHistoryProps {
  organizationId: string
  clusterId: string
  pageSize?: number
  suspense?: boolean
  enabled?: boolean
  refetchInterval?: RefetchInterval
}

export function useClusterDeploymentHistory({
  organizationId,
  clusterId,
  pageSize = 20,
  suspense = false,
  enabled = true,
  refetchInterval,
}: UseClusterDeploymentHistoryProps) {
  return useQuery({
    ...queries.clusters.deploymentHistory({ organizationId, clusterId, pageSize }),
    enabled: enabled && Boolean(organizationId) && Boolean(clusterId),
    suspense,
    refetchInterval,
    retryOnMount: true,
    staleTime: 4500,
    notifyOnChangeProps: ['data'],
  })
}

export default useClusterDeploymentHistory
