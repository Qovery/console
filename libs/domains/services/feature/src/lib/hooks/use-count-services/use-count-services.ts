import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseCountServicesProps {
  environmentId?: string
}

export function useCountServices({ environmentId }: UseCountServicesProps) {
  return useQuery({
    ...queries.services.list(environmentId!),
    enabled: Boolean(environmentId),
  })
}

export default useCountServices
