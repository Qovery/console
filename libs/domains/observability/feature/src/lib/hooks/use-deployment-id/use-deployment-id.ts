import { useQuery } from '@tanstack/react-query'
import { observability } from '@qovery/domains/observability/data-access'

export interface UseDeploymentIdProps {
  clusterId: string
  serviceId: string
}

export function useDeploymentId({ clusterId, serviceId }: UseDeploymentIdProps) {
  return useQuery({
    ...observability.deploymentId({ clusterId, serviceId }),
    enabled: Boolean(clusterId && serviceId),
  })
}

export default useDeploymentId
