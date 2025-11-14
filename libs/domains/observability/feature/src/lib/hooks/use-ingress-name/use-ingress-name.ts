import { useQuery } from '@tanstack/react-query'
import { observability } from '@qovery/domains/observability/data-access'

export interface UseIngressNameProps {
  clusterId: string
  serviceId: string
  startDate: string
  endDate: string
  enabled?: boolean
}

// Retrieves the ingress name associated with a specific service
export function useIngressName({ clusterId, serviceId, enabled = true, startDate, endDate }: UseIngressNameProps) {
  return useQuery({
    ...observability.ingressName({ clusterId, serviceId, startDate, endDate }),
    enabled: enabled && Boolean(clusterId && serviceId),
  })
}

export default useIngressName
