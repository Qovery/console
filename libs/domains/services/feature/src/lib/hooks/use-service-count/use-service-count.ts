import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface useServiceCountProps {
  environmentId?: string
}

export function useServiceCount({ environmentId }: useServiceCountProps) {
  return useQuery({
    ...queries.services.list(environmentId!),
    select: (data) => data.length,
    enabled: Boolean(environmentId),
  })
}

export default useServiceCount
