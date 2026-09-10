import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseClusterDeploymentHistoryProps {
  organizationId: string
  clusterId: string
  pageSize?: number
  suspense?: boolean
}

export function useClusterDeploymentHistory({
  organizationId,
  clusterId,
  pageSize = 20,
  suspense = false,
}: UseClusterDeploymentHistoryProps) {
  return useQuery({
    ...queries.clusters.deploymentHistory({ organizationId, clusterId, pageSize }),
    enabled: Boolean(organizationId) && Boolean(clusterId),
    suspense,
    refetchInterval: 5000,
    retryOnMount: true,
    staleTime: 4500,
    notifyOnChangeProps: ['data'],
  })
}

export default useClusterDeploymentHistory
