import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseDeploymentStatusProps {
  environmentId?: string
  suspense?: boolean
}

export function useDeploymentStatus({ environmentId, suspense = false }: UseDeploymentStatusProps) {
  return useQuery({
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    ...queries.environments.deploymentStatus(environmentId!!),
    enabled: Boolean(environmentId),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    suspense,
  })
}

export default useDeploymentStatus
