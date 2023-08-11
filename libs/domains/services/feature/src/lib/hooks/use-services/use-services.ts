import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseServicesProps {
  environmentId?: string
}

export function useServices({ environmentId }: UseServicesProps) {
  return useQuery({
    ...queries.services.list(environmentId!),
    enabled: !!environmentId,
  })
}

export default useServices
