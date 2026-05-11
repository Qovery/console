import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseServiceSummaryProps {
  environmentId?: string
  serviceId?: string
  enabled?: boolean
  suspense?: boolean
}

export function useServiceSummary({
  environmentId,
  serviceId,
  enabled = false,
  suspense = false,
}: UseServiceSummaryProps) {
  return useQuery({
    ...queries.services.list(environmentId ?? ''),
    select: (services) => services.find(({ id }) => id === serviceId),
    enabled: Boolean(environmentId) && enabled,
    suspense,
  })
}

export default useServiceSummary
