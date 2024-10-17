import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseDeploymentStatusProps {
  environmentId?: string
  serviceId?: string
}

export function useDeploymentStatus({ environmentId, serviceId }: UseDeploymentStatusProps) {
  return useQuery({
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    ...queries.services.deploymentStatus(environmentId!!, serviceId!!),
    enabled: Boolean(environmentId) && Boolean(serviceId),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  })
}

export default useDeploymentStatus
