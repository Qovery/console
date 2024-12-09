import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseDeploymentHistoryLegacyProps {
  environmentId: string
}

/* @deprecated Prefer use `useDeploymentHistory` */
export function useDeploymentHistoryLegacy({ environmentId }: UseDeploymentHistoryLegacyProps) {
  return useQuery({
    ...queries.environments.deploymentHistory({ environmentId }),
    refetchInterval: 5000,
  })
}

export default useDeploymentHistoryLegacy
