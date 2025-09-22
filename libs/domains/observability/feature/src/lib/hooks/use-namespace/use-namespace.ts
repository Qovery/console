import { useQuery } from '@tanstack/react-query'
import { observability } from '@qovery/domains/observability/data-access'

export interface UseNamespaceProps {
  clusterId: string
  serviceId: string
  enabled?: boolean
}

// Retrieves the namespace name associated with a specific service
export function useNamespace({ clusterId, serviceId, enabled = true }: UseNamespaceProps) {
  return useQuery({
    ...observability.namespace({ clusterId, serviceId }),
    enabled: enabled && Boolean(clusterId && serviceId),
  })
}

export default useNamespace
