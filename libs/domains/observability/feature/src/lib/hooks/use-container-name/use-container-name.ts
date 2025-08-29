import { useQuery } from '@tanstack/react-query'
import { observability } from '@qovery/domains/observability/data-access'

export interface UseContainerNameProps {
  clusterId: string
  serviceId: string
}

export function useContainerName({ clusterId, serviceId }: UseContainerNameProps) {
  return useQuery({
    ...observability.containerName({ clusterId, serviceId }),
    enabled: Boolean(clusterId && serviceId),
  })
}

export default useContainerName
