import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useAgenticWorkflowRunHistory({
  serviceId,
  page = 1,
  pageSize = 20,
  enabled = true,
}: {
  serviceId: string
  page?: number
  pageSize?: number
  enabled?: boolean
}) {
  return useQuery({
    ...queries.services.agenticWorkflowRunHistory({ serviceId, page, pageSize }),
    enabled: Boolean(serviceId) && enabled,
    keepPreviousData: true,
    staleTime: 5000,
    refetchInterval: 10000,
  })
}
