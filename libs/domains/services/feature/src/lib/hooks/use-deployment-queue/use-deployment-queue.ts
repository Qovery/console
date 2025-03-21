import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseDeploymentQueueProps {
  serviceId: string
}

export function useDeploymentQueue({ serviceId }: UseDeploymentQueueProps) {
  return useQuery({
    ...queries.services.deploymentQueue({ serviceId }),
    refetchInterval: 5000,
    retryOnMount: true,
    staleTime: 4500,
    notifyOnChangeProps: ['data'],
  })
}

export default useDeploymentQueue
