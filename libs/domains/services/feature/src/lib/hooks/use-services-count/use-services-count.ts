import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseServicesCountProps {
  environmentId?: string
}

export function useServicesCount({ environmentId }: UseServicesCountProps) {
  return useQuery({
    ...queries.services.list(environmentId!),
    select: (data) => data.length,
    enabled: Boolean(environmentId),
  })
}

export default useServicesCount
