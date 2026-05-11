import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseDeploymentHistoryProps {
  environmentId: string
  suspense?: boolean
}

export function useDeploymentHistory({ environmentId, suspense = false }: UseDeploymentHistoryProps) {
  return useQuery({
    ...queries.environments.deploymentHistoryV2({ environmentId }),
    refetchInterval: 5000,
    suspense,
  })
}

export default useDeploymentHistory
