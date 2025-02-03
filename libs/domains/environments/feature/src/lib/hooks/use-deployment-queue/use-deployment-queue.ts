import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseDeploymentQueueProps {
  environmentId: string
}

export function useDeploymentQueue({ environmentId }: UseDeploymentQueueProps) {
  return useQuery({
    ...queries.environments.deploymentQueue({ environmentId }),
    refetchInterval: 5000,
    retryOnMount: true,
    notifyOnChangeProps: ['data'],
  })
}

export default useDeploymentQueue
