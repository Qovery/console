import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useAgenticWorkflowRunHistory({ serviceId }: { serviceId: string }) {
  return useQuery({
    ...queries.services.agenticWorkflowRunHistory({ serviceId }),
    enabled: Boolean(serviceId),
    staleTime: 5000,
    refetchInterval: 10000,
  })
}
