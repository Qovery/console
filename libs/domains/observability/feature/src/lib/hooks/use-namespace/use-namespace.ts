import { useQuery } from '@tanstack/react-query'
import { observability } from '@qovery/domains/observability/data-access'

export interface UseNamespaceProps {
  clusterId: string
  serviceId: string
  enabled?: boolean
  start: string
  end: string
}

// Retrieves the namespace name associated with a specific service
export function useNamespace({ clusterId, serviceId, enabled = true, start, end }: UseNamespaceProps) {
  return useQuery({
    ...observability.namespace({ clusterId, serviceId, start, end }),
    enabled: enabled && Boolean(clusterId && serviceId),
  })
}

export default useNamespace
