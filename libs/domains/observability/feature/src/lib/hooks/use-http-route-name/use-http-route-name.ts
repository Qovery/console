import { useQuery } from '@tanstack/react-query'
import { observability } from '@qovery/domains/observability/data-access'

export interface UseHttpRouteNameProps {
  clusterId: string
  serviceId: string
  startDate: string
  endDate: string
  enabled?: boolean
}

// Retrieves the http route name associated with a specific service (http managed by envoy)
export function useHttpRouteName({ clusterId, serviceId, enabled = true, startDate, endDate }: UseHttpRouteNameProps) {
  return useQuery({
    ...observability.httpRouteName({ clusterId, serviceId, startDate, endDate }),
    enabled: enabled && Boolean(clusterId && serviceId),
  })
}

export default useHttpRouteName
