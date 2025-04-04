import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseDeploymentHistoryProps {
  environmentId: string
}

export function useDeploymentHistory({ environmentId }: UseDeploymentHistoryProps) {
  return useQuery({
    ...queries.environments.deploymentHistoryV2({ environmentId }),
    refetchInterval: 5000,
    retryOnMount: true,
    staleTime: 4500,
    notifyOnChangeProps: ['data'],
  })
}

export default useDeploymentHistory
