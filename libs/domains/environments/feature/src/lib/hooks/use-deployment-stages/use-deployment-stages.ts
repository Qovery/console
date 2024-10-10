import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseDeploymentStagesProps {
  environmentId?: string
}

export function useDeploymentStages({ environmentId }: UseDeploymentStagesProps) {
  return useQuery({
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    ...queries.environments.deploymentStages(environmentId!!),
    enabled: Boolean(environmentId),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  })
}

export default useDeploymentStages
