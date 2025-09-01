import { useQuery } from '@tanstack/react-query'
import { observability } from '@qovery/domains/observability/data-access'

export interface UseContainerNameProps {
  clusterId: string
  serviceId: string
  resourceType: 'deployment' | 'statefulset'
}

export function useContainerName({ clusterId, serviceId, resourceType }: UseContainerNameProps) {
  return useQuery({
    ...observability.containerName({ clusterId, serviceId, resourceType }),
    enabled: Boolean(clusterId && serviceId),
  })
}

export default useContainerName
