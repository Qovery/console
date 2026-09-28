import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useAgenticWorkflowRunHistory({ serviceId, limit }: { serviceId: string; limit?: number }) {
  return useQuery({
    ...queries.services.agenticWorkflowRunHistory({ serviceId, limit }),
    enabled: Boolean(serviceId),
    staleTime: 5000,
    refetchInterval: 10000,
  })
}
