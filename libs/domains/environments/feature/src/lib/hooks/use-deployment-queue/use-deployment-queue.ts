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
