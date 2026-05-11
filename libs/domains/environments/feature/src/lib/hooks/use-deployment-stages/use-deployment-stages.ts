import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseDeploymentStagesProps {
  environmentId?: string
  suspense?: boolean
}

export function useDeploymentStages({ environmentId, suspense = false }: UseDeploymentStagesProps) {
  return useQuery({
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    ...queries.environments.deploymentStages(environmentId!!),
    enabled: Boolean(environmentId),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    suspense,
  })
}

export default useDeploymentStages
