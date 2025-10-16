import { useQuery } from '@tanstack/react-query'
import { serviceLogs } from '@qovery/domains/service-logs/data-access'

export interface UseServiceLevelsProps {
  clusterId: string
  serviceId: string
  enabled?: boolean
}

export function useServiceLevels({ clusterId, serviceId, enabled = false }: UseServiceLevelsProps) {
  return useQuery({
    ...serviceLogs.serviceLabel({
      path: 'level',
      clusterId,
      serviceId,
    }),
    enabled: Boolean(clusterId) && Boolean(serviceId) && enabled,
  })
}

export default useServiceLevels
