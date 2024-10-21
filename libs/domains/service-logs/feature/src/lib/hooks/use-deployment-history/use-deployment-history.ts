import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseDeploymentHistoryProps {
  environmentId: string
}

export function useDeploymentHistory({ environmentId }: UseDeploymentHistoryProps) {
  return useQuery({
    ...queries.environments.deploymentHistory({ environmentId }),
    refetchInterval: 5000,
  })
}

export default useDeploymentHistory
