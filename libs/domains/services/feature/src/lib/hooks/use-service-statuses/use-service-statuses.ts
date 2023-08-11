import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseServiceStatusesProps {
  environmentId?: string
}

export function useServiceStatuses({ environmentId }: UseServiceStatusesProps) {
  return useQuery({
    ...queries.services.listStatuses(environmentId!),
    enabled: Boolean(environmentId),
  })
}

export default useServiceStatuses
