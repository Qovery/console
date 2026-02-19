import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseDeploymentHistoryProps {
  environmentId: string
  pageSize?: number
  suspense?: boolean
}

export function useDeploymentHistory({ environmentId, pageSize = 100, suspense = false }: UseDeploymentHistoryProps) {
  return useQuery({
    ...queries.environments.deploymentHistoryV2({ environmentId, pageSize }),
    refetchInterval: 5000,
    retryOnMount: true,
    staleTime: 4500,
    notifyOnChangeProps: ['data'],
    suspense,
  })
}

export default useDeploymentHistory
