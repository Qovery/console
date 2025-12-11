import { useQuery } from '@tanstack/react-query'
import { observability } from '@qovery/domains/observability/data-access'

export interface UseHpaNameProps {
  clusterId: string
  serviceId: string
  startDate: string
  endDate: string
  enabled?: boolean
}

// Retrieves the HPA name associated with a specific service
export function useHpaName({ clusterId, serviceId, enabled = true, startDate, endDate }: UseHpaNameProps) {
  return useQuery({
    ...observability.hpaName({ clusterId, serviceId, startDate, endDate }),
    enabled: enabled && Boolean(clusterId && serviceId),
  })
}

export default useHpaName
