import { useQuery } from '@tanstack/react-query'
import { observability } from '@qovery/domains/observability/data-access'

export interface UsePodNamesProps {
  clusterId: string
  statefulsetName: string
  startDate: string
  endDate: string
  enabled?: boolean
}

// Retrieves pod names for a StatefulSet using kube_pod_owner
export function usePodNames({ clusterId, statefulsetName, startDate, endDate, enabled = true }: UsePodNamesProps) {
  return useQuery({
    ...observability.podNames({ clusterId, statefulsetName, startDate, endDate }),
    enabled: enabled && Boolean(clusterId && statefulsetName),
  })
}
