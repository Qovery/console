import { useQuery } from '@tanstack/react-query'
import { serviceLogs } from '@qovery/domains/service-logs/data-access'

export interface UseServiceInstancesProps {
  clusterId: string
  serviceId: string
  enabled?: boolean
}

export function useServiceInstances({ clusterId, serviceId, enabled = false }: UseServiceInstancesProps) {
  return useQuery({
    ...serviceLogs.serviceLabel({
      path: 'pod',
      clusterId,
      serviceId,
    }),
    enabled: Boolean(clusterId) && Boolean(serviceId) && enabled,
  })
}

export default useServiceInstances
