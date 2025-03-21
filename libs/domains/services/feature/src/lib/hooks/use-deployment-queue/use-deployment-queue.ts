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
    select: (data) => {
      if (!data || !Array.isArray(data)) return data
      return [...data].sort((a, b) =>
        b.identifier.deployment_request_id.localeCompare(a.identifier.deployment_request_id)
      )
    },
  })
}

export default useDeploymentQueue
