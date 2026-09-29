import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useAgenticWorkflowRunHistory({ serviceId, pageSize = 100 }: { serviceId: string; pageSize?: number }) {
  return useQuery({
    ...queries.services.agenticWorkflowRunHistory({ serviceId, pageSize }),
    enabled: Boolean(serviceId),
    staleTime: 5000,
    refetchInterval: 10000,
  })
}
