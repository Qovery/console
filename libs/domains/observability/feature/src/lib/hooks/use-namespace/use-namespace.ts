import { useQuery } from '@tanstack/react-query'
import { observability } from '@qovery/domains/observability/data-access'

export interface UseNamespaceProps {
  clusterId: string
  serviceId: string
  startDate: string
  endDate: string
  enabled?: boolean
}

// Retrieves the namespace name associated with a specific service
export function useNamespace({ clusterId, serviceId, enabled = true, startDate, endDate }: UseNamespaceProps) {
  return useQuery({
    ...observability.namespace({ clusterId, serviceId, startDate, endDate }),
    enabled: enabled && Boolean(clusterId && serviceId),
  })
}

export default useNamespace
