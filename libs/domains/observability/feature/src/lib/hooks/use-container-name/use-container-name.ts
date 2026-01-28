import { useQuery } from '@tanstack/react-query'
import { observability } from '@qovery/domains/observability/data-access'

export interface UseContainerNameProps {
  clusterId: string
  serviceId: string
  resourceType: 'deployment' | 'statefulset'
  startDate: string
  endDate: string
}

// Retrieves the container name associated with a specific service
export function useContainerName({ clusterId, serviceId, resourceType, startDate, endDate }: UseContainerNameProps) {
  return useQuery({
    ...observability.containerName({ clusterId, serviceId, resourceType, startDate, endDate }),
    enabled: Boolean(clusterId && serviceId),
  })
}

export default useContainerName
